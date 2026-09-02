"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, ChevronDown, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrency,
  planAmount,
  type CurrencyOption,
  type PlanId,
} from "@/data/currencies";

// --- Flutterwave inline checkout typings ---------------------------------

interface FlutterwaveResponse {
  status: "successful" | "completed" | "cancelled" | string;
  transaction_id?: number;
  tx_ref: string;
  flw_ref?: string;
}

interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  redirect_url?: string;
  customer: { email: string; name?: string; phone_number?: string };
  customizations?: { title?: string; description?: string; logo?: string };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveConfig) => { close: () => void };
  }
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLANS: { id: PlanId; label: string; cadence: string }[] = [
  { id: "weekly", label: "Weekly Access", cadence: "/ week" },
  { id: "monthly", label: "Monthly Access", cadence: "/ month" },
];

export interface MultiCurrencyPayButtonProps {
  /** Currency selected on first render. Defaults to the first supported currency (NGN). */
  defaultCurrencyCode?: string;
  /** Plan selected on first render. */
  defaultPlan?: PlanId;
  title?: string;
  className?: string;
  /** Called after the server confirms the payment. */
  onVerified?: (info: {
    txRef: string;
    transactionId: number;
    currency: string;
    plan: PlanId;
  }) => void;
}

export function MultiCurrencyPayButton({
  defaultCurrencyCode = SUPPORTED_CURRENCIES[0].code,
  defaultPlan = "monthly",
  title = "2Odds VIP Membership",
  className,
  onVerified,
}: MultiCurrencyPayButtonProps) {
  const [currency, setCurrency] = useState<CurrencyOption>(
    () => getCurrency(defaultCurrencyCode) ?? SUPPORTED_CURRENCIES[0],
  );
  const [plan, setPlan] = useState<PlanId>(defaultPlan);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const router = useRouter();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const amount = useMemo(() => planAmount(currency, plan), [currency, plan]);
  const price = useMemo(
    () => formatCurrency(currency, amount),
    [currency, amount],
  );
  const cadence = plan === "weekly" ? "/ week" : "/ month";

  // Close the currency menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const resetFeedback = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const selectCurrency = useCallback(
    (next: CurrencyOption) => {
      setCurrency(next);
      setMenuOpen(false);
      resetFeedback();
    },
    [resetFeedback],
  );

  const pay = useCallback(() => {
    setError(null);
    setNotice(null);

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email so we can activate your VIP access.");
      return;
    }
    if (!PUBLIC_KEY) {
      setError(
        "Payments aren't configured yet. Set NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY to enable checkout.",
      );
      return;
    }
    if (!scriptReady || typeof window.FlutterwaveCheckout !== "function") {
      setError("Payment library is still loading — try again in a moment.");
      return;
    }

    const planLabel = plan === "weekly" ? "Weekly" : "Monthly";
    const txRef = `vip-${plan}-${currency.code}-${Date.now()}`;
    setPending(true);
    window.FlutterwaveCheckout({
      public_key: PUBLIC_KEY,
      tx_ref: txRef,
      amount,
      currency: currency.code,
      payment_options: "card,banktransfer,ussd,mobilemoney,opay",
      customer: { email },
      customizations: {
        title,
        description: `${planLabel} VIP access (${currency.name})`,
      },
      callback: (response) => {
        const completed =
          response.status === "successful" || response.status === "completed";
        if (!completed || !response.transaction_id) {
          setPending(false);
          setError("Payment was not completed. You have not been charged.");
          return;
        }
        setNotice("Payment received — verifying with our server…");
        void fetch("/api/flutterwave/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: response.transaction_id,
            tx_ref: response.tx_ref,
            tier: plan,
            currency: currency.code,
            amount,
          }),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.status === "success") {
              setNotice(
                "Payment verified — your VIP access is active. Check your email for the login link.",
              );
              // The verify response set the VIP cookie; re-render server
              // components so the locked picks unblur immediately.
              router.refresh();
              onVerified?.({
                txRef: response.tx_ref,
                transactionId: response.transaction_id!,
                currency: currency.code,
                plan,
              });
            } else {
              setNotice(null);
              setError(
                data.message ||
                  `We received your payment but could not verify it yet. Contact support with reference ${response.tx_ref}.`,
              );
            }
          })
          .catch(() => {
            setNotice(null);
            setError(
              `Payment received but verification did not run. Contact support with reference ${response.tx_ref}.`,
            );
          })
          .finally(() => setPending(false));
      },
      onclose: () => setPending(false),
    });
  }, [email, scriptReady, currency, plan, amount, title, onVerified, router]);

  return (
    <div className={cn("mx-auto w-full max-w-sm flex-col gap-4", className)}>
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          <Crown className="size-3.5" aria-hidden />
          {title}
        </p>

        {/* Plan toggle ----------------------------------------------------- */}
        <div
          role="tablist"
          aria-label="Billing plan"
          className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
        >
          {PLANS.map((p) => {
            const active = p.id === plan;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setPlan(p.id);
                  resetFeedback();
                }}
                className={cn(
                  "flex flex-col items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                {p.label}
                <span className="mt-0.5 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(currency, planAmount(currency, p.id))}
                  {" "}
                  {p.cadence}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-50">
            {price}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {cadence} · {currency.code}
          </span>
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Full VIP feed, staking plans, and early team news.
        </p>

        {/* Currency selector -------------------------------------------------- */}
        <div ref={wrapRef} className="relative mt-5">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Pay in your currency
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden className="text-base leading-none">
                {currency.flag}
              </span>
              {currency.name}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-zinc-400 transition-transform",
                menuOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {menuOpen && (
            <ul
              id={menuId}
              role="listbox"
              aria-label="Currency"
              className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
            >
              {SUPPORTED_CURRENCIES.map((c) => {
                const active = c.code === currency.code;
                return (
                  <li key={c.code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => selectCurrency(c)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900",
                        active
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-700 dark:text-zinc-300",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="text-base leading-none">
                          {c.flag}
                        </span>
                        {c.name}
                      </span>
                      <span className="flex items-center gap-2 tabular-nums text-zinc-500 dark:text-zinc-400">
                        {formatCurrency(c, planAmount(c, plan))}
                        {active && (
                          <Check className="size-4 text-emerald-500" aria-hidden />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Email ----------------------------------------------------------- */}
        <div className="mt-4">
          <label
            htmlFor={`${menuId}-email`}
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email for VIP access
          </label>
          <input
            id={`${menuId}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <button
          type="button"
          onClick={pay}
          disabled={pending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? "Opening checkout…" : `Pay ${price} with Flutterwave`}
        </button>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            {notice}
          </p>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        Payments are processed securely by Flutterwave. Access is confirmed
        server-side after verification.
      </p>
    </div>
  );
}

export default MultiCurrencyPayButton;
