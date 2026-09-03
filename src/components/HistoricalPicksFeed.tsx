"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Lock, Play, X } from "lucide-react";
import { PredictionCard } from "@/components/PredictionCard";
import { cn } from "@/lib/utils";
import type { MatchPick } from "@/lib/predictions";

/** One selectable day in the historical result toggle. */
export interface FeedDay {
  /** Pill label, e.g. "Today". */
  label: string;
  /** Human-readable edition date, or null when nothing is published for it. */
  dateLabel: string | null;
  /** Up to 6 selections for the day, interleaved free / unlockable. */
  rows: MatchPick[];
}

export interface HistoricalPicksFeedProps {
  days: FeedDay[];
  /** From the signed VIP cookie — when true every row is free and ad-free. */
  isVipActive: boolean;
}

/** Rows 2, 4, 6 (1-based) are locked for non-VIP visitors. */
function isLockedRow(index: number): boolean {
  return index % 2 === 1;
}

/** Seconds a rewarded ad must play before the row unlocks. */
const AD_DURATION_SECONDS = 5;

export function HistoricalPicksFeed({ days, isVipActive }: HistoricalPicksFeedProps) {
  const [activeDay, setActiveDay] = useState(0);
  // Row indices the visitor has unlocked by watching an ad (reset per day).
  const [unlockedRows, setUnlockedRows] = useState<number[]>([]);
  // Row whose ad is currently playing, or null when no ad modal is open.
  const [adRow, setAdRow] = useState<number | null>(null);
  const [adRemaining, setAdRemaining] = useState(AD_DURATION_SECONDS);

  const current = days[activeDay];
  const rows = current?.rows ?? [];

  const rowUnlocked = useCallback(
    (index: number) =>
      isVipActive || !isLockedRow(index) || unlockedRows.includes(index),
    [isVipActive, unlockedRows],
  );

  const lockedRemaining = rows.filter(
    (_, index) => !rowUnlocked(index),
  ).length;

  function selectDay(index: number) {
    setActiveDay(index);
    setUnlockedRows([]); // each day's locked rows must be earned on their own
    setAdRow(null);
  }

  // Kick off a rewarded ad for a specific row. A real ad-network script would be
  // invoked here (e.g. window.adBreak({ type: "reward", ... })); we simulate a
  // rewarded placement with a short countdown modal.
  const watchAd = useCallback((rowIndex: number) => {
    setAdRow(rowIndex);
    setAdRemaining(AD_DURATION_SECONDS);
  }, []);

  // Count the open ad down to zero.
  useEffect(() => {
    if (adRow === null || adRemaining <= 0) return;
    const timer = setTimeout(() => setAdRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [adRow, adRemaining]);

  const claimAdReward = useCallback(() => {
    setUnlockedRows((prev) =>
      adRow === null || prev.includes(adRow) ? prev : [...prev, adRow],
    );
    setAdRow(null);
  }, [adRow]);

  return (
    <section aria-labelledby="picks-heading" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="picks-heading"
          className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
        >
          Free picks &amp; results
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isVipActive
            ? "VIP active — all rows unlocked"
            : `${rows.length - lockedRemaining} free · ${lockedRemaining} to unlock`}
        </p>
      </div>

      {/* Historical result toggle */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Result date">
        {days.map((day, index) => (
          <button
            key={day.label}
            type="button"
            role="tab"
            aria-selected={index === activeDay}
            onClick={() => selectDay(index)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              index === activeDay
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {current?.dateLabel && (
        <p className="-mt-2 text-xs text-zinc-400">
          Showing selections for {current.dateLabel}.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No archived selections for this date yet.
        </p>
      ) : (
        <div className="grid gap-5">
          {rows.map((pick, index) => {
            const unlocked = rowUnlocked(index);
            return (
              <div key={pick.id} className="relative">
                {unlocked ? (
                  <PredictionCard pick={pick} />
                ) : (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none select-none blur-sm"
                    >
                      <PredictionCard pick={pick} />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 text-center backdrop-blur-[2px] dark:bg-black/70">
                      <Lock className="size-6 text-emerald-500" aria-hidden />
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Pick {index + 1} is locked
                      </p>
                      <button
                        type="button"
                        onClick={() => watchAd(index)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                      >
                        <Play className="size-4" aria-hidden />
                        Watch Ad to Unlock
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIP callout — only while locked rows remain and the visitor isn't VIP */}
      {!isVipActive && lockedRemaining > 0 && (
        <Link
          href="#vip-heading"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950"
        >
          <Crown className="size-4 shrink-0" aria-hidden />
          Join VIP to remove all ads and unlock instant access
        </Link>
      )}

      {/* Rewarded-ad modal */}
      {adRow !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sponsored message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Sponsored
              </span>
              <button
                type="button"
                onClick={() => setAdRow(null)}
                aria-label="Close ad"
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="my-6 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-zinc-500/10 text-sm text-zinc-500 dark:text-zinc-400">
              Advert playing…
            </div>

            {adRemaining > 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your pick unlocks in{" "}
                <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {adRemaining}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={claimAdReward}
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Reveal this pick
              </button>
            )}

            <p className="mt-4 text-[11px] text-zinc-400">
              Watch {rows.filter((_, i) => isLockedRow(i)).length} ads in total to
              reveal every locked row, or{" "}
              <Link
                href="#vip-heading"
                onClick={() => setAdRow(null)}
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                go VIP
              </Link>{" "}
              to skip them.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default HistoricalPicksFeed;
