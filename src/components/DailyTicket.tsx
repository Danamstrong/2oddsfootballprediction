import type { MatchPick, Slip } from "@/lib/predictions";
import { JsonLd } from "@/components/JsonLd";
import { predictionJsonLd } from "@/lib/seo";
import { PicksTable } from "@/components/PicksTable";

export interface DailyTicketProps {
  /** The feature slip — used only for the SportsEvent/OddsPrediction JSON-LD. */
  slip: Slip;
  /** The interleaved rows shown in the table (up to 6). */
  rows: MatchPick[];
  /** From the signed VIP cookie — unlocks every row and hides all ad prompts. */
  isVipActive: boolean;
  /** ISO date of the edition — enables the JSON-LD block. */
  editionDate?: string;
}

export function DailyTicket({
  slip,
  rows,
  isVipActive,
  editionDate,
}: DailyTicketProps) {
  return (
    <section
      aria-labelledby="daily-ticket-heading"
      className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950 text-zinc-100 shadow-lg"
    >
      <h2 id="daily-ticket-heading" className="sr-only">
        {slip.title}
      </h2>
      {editionDate && (
        <JsonLd
          data={predictionJsonLd(slip, editionDate)}
          id="schema-daily-ticket"
        />
      )}

      <PicksTable rows={rows} isVipActive={isVipActive} />

      <p className="border-t border-white/10 px-6 py-3 text-center text-[11px] text-zinc-500">
        Odds move constantly &mdash; confirm prices with your bookmaker before staking.
      </p>
    </section>
  );
}

export default DailyTicket;
