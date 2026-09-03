"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Lock, Play, X } from "lucide-react";
import { formatKickoff, type MatchPick } from "@/lib/predictions";

/** Seconds a rewarded ad must play before a row unlocks. */
const AD_DURATION_SECONDS = 5;

/** Rows 2, 4, 6 (1-based) are ad-locked for non-VIP visitors. */
function isLockedRow(index: number): boolean {
  return index % 2 === 1;
}

export interface PicksTableProps {
  /** The interleaved rows to display (up to 6). */
  rows: MatchPick[];
  /** From the signed VIP cookie — unlocks every row and hides all ad prompts. */
  isVipActive: boolean;
}

/**
 * The 6-row table inside the Daily 2-Odds slip container. Odd rows are always
 * visible; even rows are blurred behind a "Watch Ad to Unlock" prompt until the
 * visitor either watches a rewarded ad for that row or holds active VIP.
 */
export function PicksTable({ rows, isVipActive }: PicksTableProps) {
  // Row indices the visitor has unlocked by watching an ad.
  const [unlockedRows, setUnlockedRows] = useState<number[]>([]);
  // Row whose ad is currently playing, or null when no ad modal is open.
  const [adRow, setAdRow] = useState<number | null>(null);
  const [adRemaining, setAdRemaining] = useState(AD_DURATION_SECONDS);

  const rowUnlocked = useCallback(
    (index: number) =>
      isVipActive || !isLockedRow(index) || unlockedRows.includes(index),
    [isVipActive, unlockedRows],
  );

  const lockedRemaining = rows.filter(
    (_, index) => !rowUnlocked(index),
  ).length;
  const totalLocked = rows.filter((_, index) => isLockedRow(index)).length;

  // Kick off a rewarded ad for a specific row. A real ad-network script would be
  // invoked here (e.g. window.adBreak({ type: "reward", ... })); we simulate a
  // rewarded placement with a short countdown modal.
  const watchAd = useCallback((rowIndex: number) => {
    setAdRow(rowIndex);
    setAdRemaining(AD_DURATION_SECONDS);
  }, []);

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
    <>
      <ol className="divide-y divide-white/10">
        {rows.map((pick, index) => {
          const unlocked = rowUnlocked(index);
          return (
            <li
              key={pick.id}
              className="relative flex items-center gap-4 px-6 py-4"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold tabular-nums">
                {index + 1}
              </span>
              <div
                className={`min-w-0 flex-1 ${unlocked ? "" : "select-none blur-sm"}`}
                aria-hidden={!unlocked}
              >
                <p className="truncate text-sm font-semibold">
                  {pick.home} <span className="text-zinc-500">v</span> {pick.away}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {pick.league} &middot; {formatKickoff(pick.kickoff)} &middot;{" "}
                  {pick.market}:{" "}
                  <span className="text-emerald-400">{pick.selection}</span>
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${unlocked ? "" : "blur-sm"}`}
                aria-hidden={!unlocked}
              >
                {pick.odds.toFixed(2)}
              </span>

              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/40 px-6 backdrop-blur-[1px]">
                  <Lock className="size-4 shrink-0 text-emerald-400" aria-hidden />
                  <button
                    type="button"
                    onClick={() => watchAd(index)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                  >
                    <Play className="size-3.5" aria-hidden />
                    Watch Ad to Unlock
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!isVipActive && lockedRemaining > 0 && (
        <div className="border-t border-white/10 px-6 py-4">
          <Link
            href="#vip-heading"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            <Crown className="size-4 shrink-0" aria-hidden />
            Join VIP to remove all ads and unlock instant access
          </Link>
        </div>
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
              Watch {totalLocked} ads in total to reveal every locked row, or{" "}
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
    </>
  );
}

export default PicksTable;
