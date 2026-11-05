import { cn } from "@/lib/utils";
import { formatEditionDate } from "@/lib/predictions";
import type { DbPrediction, DbPredictionStatus } from "@/lib/supabase/predictions";

const statusStyles: Record<DbPredictionStatus, string> = {
  Pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  LOSS: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
};

const statusLabel: Record<DbPredictionStatus, string> = {
  Pending: "Pending",
  WON: "Won",
  LOSS: "Lost",
};

export interface PredictionCardProps {
  pick: DbPrediction;
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
          {formatEditionDate(pick.date)}
        </span>
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {pick.match_name}
        </p>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {pick.odds.toFixed(2)}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">Odds</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Pick</p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {pick.pick}
        </p>
      </div>

      <footer className="mt-auto">
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
