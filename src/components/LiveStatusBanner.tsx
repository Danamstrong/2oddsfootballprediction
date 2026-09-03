"use client";

import { useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";

const emptySubscribe = () => () => {};

/** true only after client hydration — lets us render a visitor-local value. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Hero status bar: the visitor's current date, a "ready & verified" trust
 * badge, and a pulsing live indicator. The date is rendered only after
 * hydration so it reflects the visitor's own locale/clock without a mismatch.
 */
export function LiveStatusBanner() {
  const hydrated = useIsHydrated();
  const today = hydrated
    ? new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        <time className="min-h-[1.25rem] font-medium text-zinc-600 dark:text-zinc-300">
          {today || " "}
        </time>
        <span
          aria-hidden
          className="hidden text-zinc-300 sm:inline dark:text-zinc-700"
        >
          &bull;
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex size-2.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          Picks Updated 15 mins ago
        </span>
      </div>

      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        {"🔥 Today's VIP 2+ Odds Slip is Ready & Verified"}
      </p>
    </div>
  );
}

export default LiveStatusBanner;
