"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Crown, Lock, Play } from "lucide-react";
import { formatKickoff, type MatchPick } from "@/lib/predictions";

/** Monetag Direct Link — opened in a new tab when a visitor unlocks a row. */
const MONETAG_DIRECT_LINK = "https://omg10.com/4/11717025";

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
 * visitor either opens the Monetag Direct Link for that row or holds active VIP.
 */
export function PicksTable({ rows, isVipActive }: PicksTableProps) {
  // Row indices the visitor has unlocked by engaging with the ad.
  const [unlockedRows, setUnlockedRows] = useState<number[]>([]);

  const rowUnlocked = useCallback(
    (index: number) =>
      isVipActive || !isLockedRow(index) || unlockedRows.includes(index),
    [isVipActive, unlockedRows],
  );

  const lockedRemaining = rows.filter(
    (_, index) => !rowUnlocked(index),
  ).length;

  // Open the Monetag Direct Link, then reveal the row that was tapped.
  const handleUnlockRow = (rowIndex: number) => {
    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
    setUnlockedRows((prev) =>
      prev.includes(rowIndex) ? prev : [...prev, rowIndex],
    );
  };

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
                    onClick={() => handleUnlockRow(index)}
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
    </>
  );
}

export default PicksTable;
