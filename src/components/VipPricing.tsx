"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import { Check, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { vipTiers, formatNGN, type VipTier } from "@/lib/predictions";

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

export function VipPricing() {
  const [email, setEmail] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const subscribe = useCallback(
    (tier: VipTier) => {
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

      setPending(tier.id);
      window.FlutterwaveCheckout({
        public_key: PUBLIC_KEY,
        tx_ref: `vip-${tier.id}-${Date.now()}`,
        amount: tier.amountNGN,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd,opay",
        customer: { email },
        customizations: {
          title: "2Odds VIP Membership",
          description: `${tier.name} (${tier.cadence.replace("/ ", "")})`,
        },
        callback: (response) => {
          const completed =
            response.status === "successful" ||
            response.status === "completed";
          if (!completed || !response.transaction_id) {
            setPending(null);
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
              tier: tier.id,
            }),
          })
            .then(async (res) => {
              const data = await res.json().catch(() => ({}));
              if (res.ok && data.status === "success") {
                setNotice(
                  "Payment verified — your VIP access is active. Check your email for the login link.",
                );
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
            .finally(() => setPending(null));
        },
        onclose: () => setPending(null),
      });
    },
    [email, scriptReady],
  );

  return (
    <section aria-labelledby="vip-heading" className="flex flex-col gap-8">
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />

      <div className="text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          <Crown className="size-3.5" aria-hidden />
          VIP Membership
        </p>
        <h2
          id="vip-heading"
          className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
        >
          Unlock every premium pick
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Full VIP feed, staking plans, and early team news. Secure checkout by
          Flutterwave — card, bank transfer, USSD.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <label
          htmlFor="vip-email"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email for VIP access
        </label>
        <input
          id="vip-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {vipTiers.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-6 dark:bg-zinc-950",
              tier.popular
                ? "border-emerald-500 shadow-lg md:-translate-y-2"
                : "border-zinc-200 shadow-sm dark:border-zinc-800",
            )}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Most popular
              </span>
            )}

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {tier.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {tier.blurb}
            </p>

            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatNGN(tier.amountNGN)}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {tier.cadence}
              </span>
            </p>

            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-500"
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => subscribe(tier)}
              disabled={pending !== null}
              className={cn(
                "mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60",
                tier.popular
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
              )}
            >
              {pending === tier.id && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {pending === tier.id ? "Opening checkout…" : `Get ${tier.name}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mx-auto max-w-xl rounded-xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mx-auto max-w-xl rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          {notice}
        </p>
      )}

      <p className="mx-auto max-w-xl text-center text-xs text-zinc-400">
        Payments are processed securely by Flutterwave. Grant of access is
        confirmed server-side after verification. No refunds once VIP picks for
        the paid period have been released.
      </p>
    </section>
  );
}

export default VipPricing;
