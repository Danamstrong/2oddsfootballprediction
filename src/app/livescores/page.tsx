import type { Metadata } from "next";
import Link from "next/link";
import { Radio, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchdayClock } from "@/components/MatchdayClock";
import {
  getCurrentEdition,
  allPicks,
  formatEditionDate,
  type MatchPick,
} from "@/lib/predictions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Scores",
  description:
    "Matchday live scores and status tracker for the fixtures on today's 2Odds Football Prediction card.",
  alternates: { canonical: "/livescores" },
};

type FeedStatus = "upcoming" | "live" | "ft";

const FT_AFTER_MS = 115 * 60 * 1000; // ~ full match + stoppage

function feedStatus(pick: MatchPick, now: number): FeedStatus {
  if (pick.status !== "pending") return "ft";
  const kickoff = Date.parse(pick.kickoff);
  if (Number.isNaN(kickoff)) return "upcoming";
  if (now >= kickoff + FT_AFTER_MS) return "ft";
  if (now >= kickoff) return "live";
  return "upcoming";
}

function liveMinute(pick: MatchPick, now: number): number {
  const mins = Math.floor((now - Date.parse(pick.kickoff)) / 60_000);
  return Math.min(90, Math.max(1, mins));
}

interface Fixture {
  key: string;
  league: string;
  country?: string;
  kickoff: string;
  home: string;
  away: string;
  status: FeedStatus;
  minute: number;
}

const STATUS_STYLES: Record<FeedStatus, string> = {
  upcoming: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  ft: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
};

export default function LiveScoresPage() {
  const edition = getCurrentEdition();
  const now = Date.now();

  // De-duplicate fixtures that appear in more than one slip.
  const seen = new Set<string>();
  const fixtures: Fixture[] = allPicks(edition)
    .map((p) => {
      const key = `${p.home}|${p.away}|${p.kickoff}`;
      return { p, key };
    })
    .filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ p, key }) => ({
      key,
      league: p.league,
      country: p.country,
      kickoff: p.kickoff,
      home: p.home,
      away: p.away,
      status: feedStatus(p, now),
      minute: liveMinute(p, now),
    }))
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  const byLeague = fixtures.reduce<Record<string, Fixture[]>>((acc, f) => {
    (acc[f.league] ??= []).push(f);
    return acc;
  }, {});

  const liveCount = fixtures.filter((f) => f.status === "live").length;

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Radio className="size-3.5" aria-hidden />
            Live scores
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Matchday tracker
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Status of every fixture on the{" "}
            <Link
              href="/"
              className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {formatEditionDate(edition.date)} card
            </Link>
            . Kickoff times are UTC. {liveCount > 0
              ? `${liveCount} match${liveCount === 1 ? "" : "es"} in play.`
              : "Nothing in play right now."}
          </p>
          <MatchdayClock />
        </header>

        {fixtures.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No fixtures on the current card.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(byLeague).map(([league, list]) => (
              <section
                key={league}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  {league}
                  {list[0].country ? ` · ${list[0].country}` : ""}
                </h2>
                <ul>
                  {list.map((f) => (
                    <li
                      key={f.key}
                      className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-900"
                    >
                      <span className="w-14 shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                        {new Intl.DateTimeFormat("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                          hour12: false,
                        }).format(new Date(f.kickoff))}
                      </span>

                      <div className="min-w-0 flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        <p className="truncate">{f.home}</p>
                        <p className="truncate text-zinc-500 dark:text-zinc-400">
                          {f.away}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                          STATUS_STYLES[f.status],
                        )}
                      >
                        {f.status === "live" && (
                          <span className="size-1.5 animate-pulse rounded-full bg-current" />
                        )}
                        {f.status === "upcoming" && "Upcoming"}
                        {f.status === "live" && `Live ${f.minute}'`}
                        {f.status === "ft" && "Full time"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
          <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Status is derived from kickoff time and settlement. Goal-by-goal score
          updates come through on matchday; this page refreshes itself every
          minute.
        </p>
      </div>
    </main>
  );
}
