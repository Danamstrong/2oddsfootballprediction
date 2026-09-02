import { NextResponse } from "next/server";
import { VIP_COOKIE, encodeVipAccess, vipCookieOptions } from "@/lib/vip-access";
import {
  DEFAULT_CURRENCY,
  expectedAmountFor,
  getCurrency,
  isAcceptedAmount,
  membershipExpiry,
  parseTxRef,
  resolveTier,
} from "@/lib/vip-membership";

// Uses FLW_SECRET_KEY (server only) — never runs on the edge/client.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const verifyUrl = (id: string) =>
  `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(id)}/verify`;

interface VerifyBody {
  transaction_id?: string | number;
  tx_ref?: string;
  tier?: string;
  currency?: string;
  amount?: string | number;
}

interface FlwTransaction {
  id: number;
  tx_ref: string;
  amount: number;
  charged_amount: number;
  currency: string;
  status: string;
  payment_type?: string;
  customer?: { email?: string; name?: string; phone_number?: string };
  created_at?: string;
}

interface FlwVerifyResponse {
  status: string;
  message: string;
  data?: FlwTransaction;
}

function fail(message: string, status: number, details?: string[]) {
  return NextResponse.json(
    { status: "error", message, ...(details ? { details } : {}) },
    { status },
  );
}

export async function POST(req: Request) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return fail("Payment verification is not configured on the server.", 500);
  }

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const transactionId =
    body.transaction_id != null ? String(body.transaction_id).trim() : "";
  if (!transactionId) {
    return fail("`transaction_id` is required.", 400);
  }

  const parsed = parseTxRef(body.tx_ref);

  // Expected tier: explicit `tier` wins, otherwise derive it from `tx_ref`.
  const tier = resolveTier(body.tier ?? parsed.tierId);
  if (!tier) {
    return fail("Could not resolve a known VIP tier for this payment.", 400);
  }

  // Expected currency: explicit `currency` wins, then `tx_ref`, then NGN.
  const currencyCode = (
    body.currency ??
    parsed.currencyCode ??
    DEFAULT_CURRENCY
  ).toUpperCase();
  const currency = getCurrency(currencyCode);
  if (!currency) {
    return fail(`Unsupported checkout currency "${currencyCode}".`, 400);
  }

  // Expected price for this plan (weekly/monthly) in this currency.
  const expectedAmount = expectedAmountFor(tier, currency);
  if (expectedAmount == null) {
    return fail(
      `${tier.name} is only priced in ${DEFAULT_CURRENCY}; ${currency.code} checkout supports the weekly and monthly plans only.`,
      400,
    );
  }

  // --- The client tells us what it thinks it charged; hold it to our config.
  const problems: string[] = [];

  const requestedCurrency = body.currency
    ? String(body.currency).toUpperCase()
    : undefined;
  if (requestedCurrency && requestedCurrency !== currency.code) {
    problems.push(
      `requested currency "${requestedCurrency}" does not match the resolved currency "${currency.code}"`,
    );
  }

  const requestedAmount =
    body.amount != null && body.amount !== ""
      ? Number(body.amount)
      : undefined;
  if (
    requestedAmount != null &&
    (!Number.isFinite(requestedAmount) ||
      !isAcceptedAmount(currency.code, requestedAmount, expectedAmount))
  ) {
    problems.push(
      `requested amount ${body.amount} does not match the published ${currency.code} price ${expectedAmount}`,
    );
  }

  if (problems.length > 0) {
    return fail("Checkout request failed validation.", 400, problems);
  }

  // --- Ask Flutterwave what actually happened ----------------------------
  let payload: FlwVerifyResponse;
  try {
    const res = await fetch(verifyUrl(transactionId), {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    payload = (await res.json()) as FlwVerifyResponse;
    if (!res.ok || payload.status !== "success" || !payload.data) {
      return fail(
        payload?.message || "Flutterwave could not verify this transaction.",
        502,
      );
    }
  } catch {
    return fail("Failed to reach Flutterwave for verification.", 502);
  }

  const tx = payload.data;

  // --- Confirm the settled transaction matches the requested tier/currency.
  if (tx.status !== "successful") {
    problems.push(`transaction status is "${tx.status}", expected "successful"`);
  }
  if ((tx.currency ?? "").toUpperCase() !== currency.code) {
    problems.push(`currency "${tx.currency}", expected "${currency.code}"`);
  }
  if (!isAcceptedAmount(currency.code, Number(tx.amount), expectedAmount)) {
    problems.push(
      `amount ${tx.amount} is below the ${tier.name} ${currency.code} price ${expectedAmount} (beyond the fee tolerance)`,
    );
  }
  if (body.tx_ref && tx.tx_ref !== body.tx_ref) {
    problems.push("tx_ref does not match the one this checkout was started with");
  }
  if (problems.length > 0) {
    return fail("Payment failed verification.", 400, problems);
  }

  // TODO: idempotency + persistence.
  //  1. Reject if `tx.id` has already been redeemed (store used transaction ids).
  //  2. Upsert membership: { email: tx.customer.email, tier: tier.id,
  //     expiresAt: now + tier period } in your database.
  //  3. Trigger the "VIP access activated" email.

  // --- Grant VIP access to this browser so the picks unblur immediately.
  const res = NextResponse.json({
    status: "success",
    message: "Payment verified.",
    membership: {
      tier: tier.id,
      tierName: tier.name,
      amount: tx.amount,
      currency: tx.currency,
      expectedAmount,
      email: tx.customer?.email ?? null,
      paymentType: tx.payment_type ?? null,
      transactionId: tx.id,
      txRef: tx.tx_ref,
      paidAt: tx.created_at ?? null,
    },
  });
  const paidAtMs = tx.created_at ? Date.parse(tx.created_at) : Date.now();
  res.cookies.set(
    VIP_COOKIE,
    encodeVipAccess({
      tier: tier.id,
      email: tx.customer?.email ?? null,
      txRef: tx.tx_ref,
      exp: membershipExpiry(tier.id, Number.isNaN(paidAtMs) ? Date.now() : paidAtMs),
    }),
    // httpOnly + SameSite=Lax + Path=/
    vipCookieOptions(),
  );
  return res;
}
