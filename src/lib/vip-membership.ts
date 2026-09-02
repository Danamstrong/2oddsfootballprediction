import { vipTiers, type VipTier } from "@/lib/predictions";
import { getCurrency, type CurrencyOption } from "@/data/currencies";

/** Pricing + amount-matching rules shared by the Flutterwave routes. */

export const DEFAULT_CURRENCY = "NGN";

/** Days of VIP access granted per tier. */
export const TIER_DAYS: Record<string, number> = {
  weekly: 7,
  monthly: 31,
  season: 92,
};

/**
 * Amounts accepted for live end-to-end testing in addition to the real
 * per-currency prices. Keep this empty in production.
 */
export const TEST_AMOUNTS: Record<string, number[]> = {
  NGN: [100],
};

// Accept payments slightly under the target so processor fees and FX rounding
// (e.g. 102 charged vs 100 expected, or 99.4 settled) still verify. Overpayment
// is always fine; this only widens how far *under* the target we tolerate.
const TOLERANCE_RATIO = 0.03;
const TOLERANCE_MIN = 1;

export function withinTolerance(paid: number, target: number): boolean {
  if (!Number.isFinite(paid) || !Number.isFinite(target)) return false;
  const slack = Math.max(TOLERANCE_MIN, target * TOLERANCE_RATIO);
  return paid >= target - slack;
}

/** True if `paid` covers `expected` (within tolerance) or a known test amount. */
export function isAcceptedAmount(
  currencyCode: string,
  paid: number,
  expected: number,
): boolean {
  if (withinTolerance(paid, expected)) return true;
  return (TEST_AMOUNTS[currencyCode] ?? []).some((t) => withinTolerance(paid, t));
}

/**
 * Parse the tx_ref shapes this app creates:
 *   `vip-<tierId>-<CUR>-<timestamp>`  — MultiCurrencyPayButton
 *   `vip-<tierId>-<timestamp>`        — legacy NGN-only VipPricing
 */
export function parseTxRef(txRef?: string | null): {
  tierId?: string;
  currencyCode?: string;
} {
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

export function resolveTier(id?: string | null): VipTier | undefined {
  return id ? vipTiers.find((t) => t.id === id.toLowerCase()) : undefined;
}

/**
 * The price we expect to have charged for `tier` in `currency`.
 * `src/data/currencies.ts` only encodes the monthly-access equivalent per
 * currency, so non-NGN checkout is limited to the monthly tier; every tier is
 * priced in NGN via `vipTiers`.
 */
export function expectedAmountFor(
  tier: VipTier,
  currency: CurrencyOption,
): number | null {
  if (currency.code === DEFAULT_CURRENCY) return tier.amountNGN;
  return tier.id === "monthly" ? currency.amount : null;
}

/** Membership expiry (epoch seconds) for a tier that started at `paidAtMs`. */
export function membershipExpiry(tierId: string, paidAtMs: number): number {
  const days = TIER_DAYS[tierId] ?? TIER_DAYS.monthly;
  return Math.floor((paidAtMs + days * 24 * 60 * 60 * 1000) / 1000);
}

export { getCurrency };
export type { CurrencyOption, VipTier };
