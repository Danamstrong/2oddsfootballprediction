import { NextResponse } from "next/server";
import { vipTiers, type VipTier } from "@/lib/predictions";
import { getCurrency, type CurrencyOption } from "@/data/currencies";

// Uses FLW_SECRET_KEY (server only) — never runs on the edge/client.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_CURRENCY = "NGN";
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

/**
 * Parse the tx_ref shapes this app creates:
 *   `vip-<tierId>-<CUR>-<timestamp>`  — MultiCurrencyPayButton
 *   `vip-<tierId>-<timestamp>`        — legacy NGN-only VipPricing
 */
function parseTxRef(txRef?: string): { tierId?: string; currencyCode?: string } {
  if (!txRef) return {};
  const withCurrency = /^vip-([a-z0-9]+)-([A-Za-z]{3})-\d+$/.exec(txRef);
  if (withCurrency) {
    return {
      tierId: withCurrency[1].toLowerCase(),
      currencyCode: withCurrency[2].toUpperCase(),
    };
  }
  const legacy = /^vip-([a-z0-9]+)-\d+$/.exec(txRef);
  if (legacy) return { tierId: legacy[1].toLowerCase() };
  return {};
}

/**
 * The price we expect to have charged for `tier` in `currency`.
 * `src/data/currencies.ts` only encodes the monthly-access equivalent per
 * currency, so non-NGN checkout is limited to the monthly tier; every tier is
 * priced in NGN via `vipTiers`.
 */
function expectedAmountFor(
  tier: VipTier,
  currency: CurrencyOption,
): number | null {
  if (currency.code === DEFAULT_CURRENCY) return tier.amountNGN;
  return tier.id === "monthly" ? currency.amount : null;
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
  const tierId = (body.tier ?? parsed.tierId)?.toLowerCase();
  const tier = vipTiers.find((t) => t.id === tierId);
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

  const expectedAmount = expectedAmountFor(tier, currency);
  if (expectedAmount == null) {
    return fail(
      `${tier.name} is only priced in ${DEFAULT_CURRENCY}; ${currency.code} checkout supports the monthly plan only.`,
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
    (!Number.isFinite(requestedAmount) || requestedAmount !== expectedAmount)
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
  if (Number(tx.amount) < expectedAmount) {
    problems.push(
      `amount ${tx.amount} is below the ${tier.name} ${currency.code} price ${expectedAmount}`,
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

  return NextResponse.json({
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
}
