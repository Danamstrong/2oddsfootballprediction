export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  amount: number; // Equivalent price for monthly VIP access
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigeria (NGN)', flag: '🇳🇬', amount: 5000 },
  { code: 'USD', symbol: '$', name: 'United States (USD)', flag: '🇺🇸', amount: 10 },
  { code: 'GBP', symbol: '£', name: 'United Kingdom (GBP)', flag: '🇬🇧', amount: 8 },
  { code: 'EUR', symbol: '€', name: 'Eurozone (EUR)', flag: '🇪🇺', amount: 9 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana (GHS)', flag: '🇬🇭', amount: 120 },
  { code: 'KES', symbol: 'KSh', name: 'Kenya (KES)', flag: '🇰🇪', amount: 1300 },
  { code: 'ZAR', symbol: 'R', name: 'South Africa (ZAR)', flag: '🇿🇦', amount: 180 },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzania (TZS)', flag: '🇹🇿', amount: 26000 },
  { code: 'UGX', symbol: 'USh', name: 'Uganda (UGX)', flag: '🇺🇬', amount: 37000 },
  { code: 'XAF', symbol: 'CFA', name: 'Cameroon (XAF)', flag: '🇨🇲', amount: 6000 },
  { code: 'XOF', symbol: 'CFA', name: 'Franc Zone (XOF)', flag: '🇸🇳', amount: 6000 },
  { code: 'RWF', symbol: 'RF', name: 'Rwanda (RWF)', flag: '🇷🇼', amount: 13000 },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambia (ZMW)', flag: '🇿🇲', amount: 260 },
  { code: 'SLE', symbol: 'Le', name: 'Sierra Leone (SLE)', flag: '🇸🇱', amount: 220 },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

export function getCurrency(code: string): CurrencyOption | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
}

/** Format an amount in its own currency, e.g. `$10`, `₦5,000`. */
export function formatCurrency({ symbol, amount, code }: CurrencyOption): string {
  return `${symbol}${new Intl.NumberFormat("en", {
    maximumFractionDigits: code === "NGN" || amount % 1 === 0 ? 0 : 2,
  }).format(amount)}`;
}
