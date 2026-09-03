import { Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceModal } from "@/components/ConfidenceModal";
import { formatKickoff, type MatchPick, type PickStatus } from "@/lib/predictions";

const statusStyles: Record<PickStatus, string> = {
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  lost: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  void: "bg-zinc-100 text-zinc-500 line-through dark:bg-zinc-800 dark:text-zinc-400",
};

const statusLabel: Record<PickStatus, string> = {
  pending: "Pending",
  won: "Won",
  lost: "Lost",
  void: "Void",
};

export interface PredictionCardProps {
  pick: MatchPick;
  className?: string;
}

export function PredictionCard({ pick, className }: PredictionCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          {pick.league}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Clock className="size-3.5" aria-hidden />
          {formatKickoff(pick.kickoff)}
        </span>
      </header>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          <p className="truncate">{pick.home}</p>
          <p className="truncate text-zinc-500 dark:text-zinc-400">{pick.away}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {pick.odds.toFixed(2)}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Odds</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">
          {pick.market}
        </p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {pick.selection}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {pick.analysis}
      </p>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3.5" aria-hidden />
            Confidence
          </span>
          <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
            {pick.confidence}%
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={pick.confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pick.confidence}% confidence`}
        >
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${pick.confidence}%` }}
          />
        </div>
        <ConfidenceModal />
      </div>

      <footer>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            statusStyles[pick.status],
          )}
        >
          {statusLabel[pick.status]}
        </span>
      </footer>
    </article>
  );
}

export default PredictionCard;
