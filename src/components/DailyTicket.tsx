import { Flame } from "lucide-react";
import { formatKickoff, slipStatus, type Slip } from "@/lib/predictions";
import { JsonLd } from "@/components/JsonLd";
import { predictionJsonLd } from "@/lib/seo";

export interface DailyTicketProps {
  slip: Slip;
  /** ISO date of the edition — enables SportsEvent/OddsPrediction JSON-LD. */
  editionDate?: string;
}

const statusTone: Record<ReturnType<typeof slipStatus>, string> = {
  pending: "text-zinc-400",
  won: "text-emerald-400",
  lost: "text-rose-400",
  void: "text-zinc-500",
};

export function DailyTicket({ slip, editionDate }: DailyTicketProps) {
  const status = slipStatus(slip.selections);

  return (
    <section
      aria-labelledby="daily-ticket-heading"
      className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950 text-zinc-100 shadow-lg"
    >
      {editionDate && (
        <JsonLd
          data={predictionJsonLd(slip, editionDate)}
          id="schema-daily-ticket"
        />
      )}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-6 py-4">
        <Flame className="size-5 text-emerald-400" aria-hidden />
        <h2 id="daily-ticket-heading" className="text-lg font-bold">
          {slip.title}
        </h2>
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${statusTone[status]}`}
        >
          {status}
        </span>
      </div>

      <ol className="divide-y divide-white/10">
        {slip.selections.map((s, i) => (
          <li key={s.id} className="flex items-center gap-4 px-6 py-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold tabular-nums">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {s.home} <span className="text-zinc-500">v</span> {s.away}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {s.league} &middot; {formatKickoff(s.kickoff)} &middot; {s.market}:{" "}
                <span className="text-emerald-400">{s.selection}</span>
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {s.odds.toFixed(2)}
            </span>
          </li>
        ))}
      </ol>

      <p className="border-t border-white/10 px-6 py-3 text-center text-[11px] text-zinc-500">
        Odds move constantly &mdash; confirm prices with your bookmaker before staking.
      </p>
    </section>
  );
}

export default DailyTicket;
