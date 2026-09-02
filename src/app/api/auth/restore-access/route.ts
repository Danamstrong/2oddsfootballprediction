import { NextResponse } from "next/server";
import { VIP_COOKIE, encodeVipAccess, vipCookieOptions } from "@/lib/vip-access";
import {
  expectedAmountFor,
  getCurrency,
  isAcceptedAmount,
  membershipExpiry,
  parseTxRef,
  resolveTier,
  type VipTier,
} from "@/lib/vip-membership";

/**
 * Email lookup / access restore.
 *
 * A paid browser gets the `vip_access` cookie from `verify/route.ts`, but that
 * cookie only lives on the device that checked out. This endpoint lets someone
 * who paid on desktop re-enter their email on mobile: we ask Flutterwave for
 * that customer's settled transactions, confirm one is a still-active VIP
 * payment, and re-issue the same signed cookie — no second charge.
 *
 * Uses FLW_SECRET_KEY (server only).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RestoreBody {
  email?: string;
}

interface FlwListTx {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  status: string;
  created_at?: string;
  customer?: { email?: string };
}

interface FlwListResponse {
  status: string;
  message: string;
  data?: FlwListTx[];
}

interface RestoredMembership {
  tier: VipTier;
  exp: number;
  txRef: string;
  paidAt: string | null;
}

function fail(message: string, status: number) {
  return NextResponse.json({ status: "error", message }, { status });
}

function listUrl(email: string): string {
  const params = new URLSearchParams({
    customer_email: email,
    status: "successful",
  });
  return `https://api.flutterwave.com/v3/transactions?${params.toString()}`;
}

/** Map a settled transaction to an active VIP membership, or null. */
function toActiveMembership(tx: FlwListTx): RestoredMembership | null {
  if (tx.status !== "successful") return null;

  const { tierId, currencyCode } = parseTxRef(tx.tx_ref);
  const tier = resolveTier(tierId);
  if (!tier) return null;

  const currency = getCurrency(currencyCode ?? "NGN");
  if (!currency) return null;

  const expected = expectedAmountFor(tier, currency);
  if (expected == null) return null;
  if (
    (tx.currency ?? "").toUpperCase() !== currency.code ||
    !isAcceptedAmount(currency.code, Number(tx.amount), expected)
  ) {
    return null;
  }

  const paidAtMs = tx.created_at ? Date.parse(tx.created_at) : NaN;
  const startedAt = Number.isNaN(paidAtMs) ? Date.now() : paidAtMs;
  const exp = membershipExpiry(tier.id, startedAt);
  if (exp * 1000 < Date.now()) return null; // membership window has passed

  return { tier, exp, txRef: tx.tx_ref, paidAt: tx.created_at ?? null };
}

export async function POST(req: Request) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return fail("Access restore is not configured on the server.", 500);
  }

  let body: RestoreBody;
  try {
    body = (await req.json()) as RestoreBody;
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return fail("Enter the email address you used at checkout.", 400);
  }

  // TODO: rate-limit by IP/email — this endpoint confirms whether an email has
  // an active membership, which is an enumeration vector without a limiter.
  let payload: FlwListResponse;
  try {
    const res = await fetch(listUrl(email), {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    payload = (await res.json()) as FlwListResponse;
    if (
      !res.ok ||
      payload.status !== "success" ||
      !Array.isArray(payload.data)
    ) {
      return fail(
        payload?.message ||
          "Could not reach Flutterwave to look up your payment.",
        502,
      );
    }
  } catch {
    return fail("Could not reach Flutterwave to look up your payment.", 502);
  }

  const membership = payload.data
    .filter((tx) => (tx.customer?.email ?? "").toLowerCase() === email)
    .map(toActiveMembership)
    .filter((m): m is RestoredMembership => m !== null)
    .sort((a, b) => b.exp - a.exp)[0];

  if (!membership) {
    return fail(
      "No active VIP membership found for that email. If you just paid, wait a minute and try again.",
      404,
    );
  }

  const out = NextResponse.json({
    status: "success",
    message: "VIP access restored on this device.",
    membership: {
      tier: membership.tier.id,
      tierName: membership.tier.name,
      email,
      txRef: membership.txRef,
      paidAt: membership.paidAt,
      expiresAt: new Date(membership.exp * 1000).toISOString(),
    },
  });
  out.cookies.set(
    VIP_COOKIE,
    encodeVipAccess({
      tier: membership.tier.id,
      email,
      txRef: membership.txRef,
      exp: membership.exp,
    }),
    // httpOnly + SameSite=Lax + Path=/
    vipCookieOptions(),
  );
  return out;
}
