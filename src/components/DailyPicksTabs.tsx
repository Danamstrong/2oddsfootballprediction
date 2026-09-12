"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PicksTable } from "@/components/PicksTable";
import type { MatchPick } from "@/lib/predictions";

export interface DailyPicksTabsProps {
  /** Today's rows — shown by default. */
  todayRows: MatchPick[];
  /** Short label for the "Today" tab, e.g. "12 Sep". */
  todayLabel: string;
  /** Yesterday's settled rows, if that edition exists. */
  yesterdayRows: MatchPick[];
  /** Short label for the "Yesterday" tab, e.g. "11 Sep". */
  yesterdayLabel: string;
  /** From the signed VIP cookie — unlocks every row and hides all ad prompts. */
  isVipActive: boolean;
}

type Tab = "today" | "yesterday";

/**
 * Toggles the ticket table between today's live picks and yesterday's
 * settled results. Ad-lock/VIP-unlock behaviour in PicksTable applies to
 * both views unchanged.
 */
export function DailyPicksTabs({
  todayRows,
  todayLabel,
  yesterdayRows,
  yesterdayLabel,
  isVipActive,
}: DailyPicksTabsProps) {
  const [tab, setTab] = useState<Tab>("today");
  const hasYesterday = yesterdayRows.length > 0;

  return (
    <>
      <div
        role="tablist"
        aria-label="Prediction day"
        className="flex gap-1 border-b border-white/10 px-3 pt-3 sm:px-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "yesterday"}
          disabled={!hasYesterday}
          onClick={() => setTab("yesterday")}
          className={cn(
            "rounded-t-lg px-3 py-2 text-xs font-semibold sm:text-sm",
            tab === "yesterday"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-zinc-200",
            !hasYesterday && "cursor-not-allowed opacity-40 hover:text-zinc-400",
          )}
        >
          Yesterday {yesterdayLabel ? `(${yesterdayLabel})` : ""}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "today"}
          onClick={() => setTab("today")}
          className={cn(
            "rounded-t-lg px-3 py-2 text-xs font-semibold sm:text-sm",
            tab === "today"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-zinc-200",
          )}
        >
          Today {todayLabel ? `(${todayLabel})` : ""}
        </button>
      </div>

      {tab === "today" ? (
        <PicksTable rows={todayRows} isVipActive={isVipActive} />
      ) : (
        <PicksTable rows={yesterdayRows} isVipActive={isVipActive} showResult />
      )}
    </>
  );
}

export default DailyPicksTabs;
