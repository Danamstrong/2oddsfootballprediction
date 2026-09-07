import { Lock, TrendingUp } from "lucide-react";

/**
 * A generic, data-free stand-in for the VIP grid shown to non-VIP visitors.
 * Deliberately renders no real match, market, selection, odds, or analysis —
 * real VIP pick data must never reach an unauthenticated client, even
 * blurred (CSS blur ships the underlying HTML/RSC payload as-is; it's
 * trivially readable via view-source or devtools). The actual picks only
 * ever leave the server for a session-verified VIP request — see /vip and
 * /api/vip-picks.
 */
export function LockedVipPreview({ count }: { count: number }) {
  const cards = Array.from({ length: Math.max(count, 1) });

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none grid select-none gap-5 blur-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-7 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
              <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="size-3.5" aria-hidden />
                Confidence
              </span>
              <div className="h-3 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 text-center backdrop-blur-[2px] dark:bg-black/60">
        <Lock className="size-6 text-emerald-500" aria-hidden />
        <p className="max-w-xs text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {count} VIP pick{count === 1 ? "" : "s"} locked.
        </p>
      </div>
    </div>
  );
}

export default LockedVipPreview;
