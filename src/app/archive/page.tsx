import type { Metadata } from "next";
import { Archive, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getArchiveRows,
  formatEditionDate,
  type ArchiveRow,
} from "@/lib/predictions";

export const metadata: Metadata = {
  title: "Pick Archive",
  description:
    "The full settled history of 2Odds Football Prediction picks — date, fixture, odds and result. Wins and losses, all public.",
  alternates: { canonical: "/archive" },
};

function ResultBadge({ result }: { result: ArchiveRow["result"] }) {
  const won = result === "won";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        won
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
      )}
    >
      {won ? "Won" : "Loss"}
    </span>
  );
}

export default function ArchivePage() {
  const rows = getArchiveRows();
  const won = rows.filter((r) => r.result === "won").length;
  const total = rows.length;
  const strikeRate = total === 0 ? 0 : Math.round((won / total) * 100);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Archive className="size-3.5" aria-hidden />
            Historical archive
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Pick archive
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Every settled single pick we&rsquo;ve published, most recent first.
            We list the fixture, the odds taken, and whether it landed — nothing
            more. Specific markets and selections stay private so results
            can&rsquo;t be used to reverse-engineer the model.
          </p>
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-500" aria-hidden />
              <dt className="sr-only">Strike rate</dt>
              <dd>
                {won}/{total} won &middot; {strikeRate}% strike rate
              </dd>
            </div>
          </dl>
        </header>

        {total === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No settled picks yet — check back after this matchday.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Match &amp; League
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Odds
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 tabular-nums dark:text-zinc-400">
                      {formatEditionDate(r.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {r.home} vs {r.away}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        {r.league}
                        {r.country ? ` · ${r.country}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                      {r.odds.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ResultBadge result={r.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs leading-relaxed text-zinc-400">
          Past results are not a guarantee of future performance. Odds shown are
          those available at time of publishing and will have moved since.
        </p>
      </div>
    </main>
  );
}
