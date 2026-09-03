import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { LiveScoreWidget } from "@/components/LiveScoreWidget";

export const metadata: Metadata = {
  title: "Live Scores",
  description:
    "Real-time football live scores across every major league, plus the fixtures on today's 2Odds Football Prediction card.",
  alternates: { canonical: "/livescores" },
};

export default function LiveScoresPage() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Radio className="size-3.5" aria-hidden />
            Live scores
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Real-time football scores
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Live goals, half-times, and full-times across every major league.
            Track match fixtures as they play out in real time.
          </p>
        </header>

        <LiveScoreWidget />

        <p className="text-xs leading-relaxed text-zinc-400">
          Scores are supplied by a third-party feed and update automatically. A
          result is only settled on our archive once officially confirmed.
        </p>
      </div>
    </main>
  );
}
