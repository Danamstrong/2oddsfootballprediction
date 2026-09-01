import { NextResponse } from "next/server";
import { vipTiers } from "@/lib/predictions";

// Uses FLW_SECRET_KEY (server only) — never runs on the edge/client.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_CURRENCY = "NGN";
const verifyUrl = (id: string) =>
  `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(id)}/verify`;

interface VerifyBody {
  transaction_id?: string | number;
  tx_ref?: string;
  tier?: string;
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

/** `vip-<tierId>-<timestamp>` — the tx_ref shape created by VipPricing. */
function tierIdFromTxRef(txRef?: string): string | undefined {
  if (!txRef) return undefined;
  return /^vip-([a-z0-9]+)-\d+$/i.exec(txRef)?.[1]?.toLowerCase();
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

  // Expected tier: explicit `tier` wins, otherwise derive it from `tx_ref`.
  const tierId = (body.tier ?? tierIdFromTxRef(body.tx_ref))?.toLowerCase();
  const tier = vipTiers.find((t) => t.id === tierId);
  if (!tier) {
    return fail("Could not resolve a known VIP tier for this payment.", 400);
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

  // --- Confirm the payment matches the tier it claims to be --------------
  const problems: string[] = [];
  if (tx.status !== "successful") {
    problems.push(`transaction status is "${tx.status}", expected "successful"`);
  }
  if (tx.currency !== EXPECTED_CURRENCY) {
    problems.push(`currency "${tx.currency}", expected "${EXPECTED_CURRENCY}"`);
  }
  if (Number(tx.amount) < tier.amountNGN) {
    problems.push(`amount ${tx.amount} is below the ${tier.name} price ${tier.amountNGN}`);
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

  return NextResponse.json({
    status: "success",
    message: "Payment verified.",
    membership: {
      tier: tier.id,
      tierName: tier.name,
      amount: tx.amount,
      currency: tx.currency,
      email: tx.customer?.email ?? null,
      paymentType: tx.payment_type ?? null,
      transactionId: tx.id,
      txRef: tx.tx_ref,
      paidAt: tx.created_at ?? null,
    },
  });
}
