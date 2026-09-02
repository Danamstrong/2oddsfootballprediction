export type PlanId = "weekly" | "monthly";

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  monthlyAmount: number;
  weeklyAmount: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigeria (NGN)', flag: '🇳🇬', monthlyAmount: 30000, weeklyAmount: 10500 },
  { code: 'USD', symbol: '$', name: 'United States (USD)', flag: '🇺🇸', monthlyAmount: 50, weeklyAmount: 18 },
  { code: 'GBP', symbol: '£', name: 'United Kingdom (GBP)', flag: '🇬🇧', monthlyAmount: 45, weeklyAmount: 16 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana (GHS)', flag: '🇬🇭', monthlyAmount: 300, weeklyAmount: 105 },
  { code: 'KES', symbol: 'KSh', name: 'Kenya (KES)', flag: '🇰🇪', monthlyAmount: 3000, weeklyAmount: 1050 },
  { code: 'ZAR', symbol: 'R', name: 'South Africa (ZAR)', flag: '🇿🇦', monthlyAmount: 450, weeklyAmount: 160 },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzania (TZS)', flag: '🇹🇿', monthlyAmount: 60000, weeklyAmount: 21000 },
  { code: 'UGX', symbol: 'USh', name: 'Uganda (UGX)', flag: '🇺🇬', monthlyAmount: 85000, weeklyAmount: 30000 },
  { code: 'XAF', symbol: 'CFA', name: 'Cameroon (XAF)', flag: '🇨🇲', monthlyAmount: 15000, weeklyAmount: 5250 },
  { code: 'XOF', symbol: 'CFA', name: 'Franc Zone (XOF)', flag: '🇸🇳', monthlyAmount: 15000, weeklyAmount: 5250 },
  { code: 'RWF', symbol: 'RF', name: 'Rwanda (RWF)', flag: '🇷🇼', monthlyAmount: 35000, weeklyAmount: 12250 },
  { code: 'ZMW', symbol: 'ZMW', name: 'Zambia (ZMW)', flag: '🇿🇲', monthlyAmount: 500, weeklyAmount: 175 },
  { code: 'SLE', symbol: 'Le', name: 'Sierra Leone (SLE)', flag: '🇸🇱', monthlyAmount: 600, weeklyAmount: 210 },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

export function getCurrency(code: string): CurrencyOption | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
}

/** Price for a plan in a given currency. */
export function planAmount(currency: CurrencyOption, plan: PlanId): number {
  return plan === "weekly" ? currency.weeklyAmount : currency.monthlyAmount;
}

/** Format a numeric amount in its own currency, e.g. `$50`, `₦30,000`. */
export function formatCurrency(currency: CurrencyOption, amount: number): string {
  return `${currency.symbol}${new Intl.NumberFormat("en", {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)}`;
}
