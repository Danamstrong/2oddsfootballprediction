import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Database,
  Wallet,
  LineChart,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { performance, getEditions } from "@/lib/predictions";

export const metadata: Metadata = {
  title: "About",
  description:
    "The team, the statistical models, and the disciplined bankroll approach behind 2Odds Football Prediction.",
  alternates: { canonical: "/about" },
};

const credentials = [
  {
    icon: Users,
    title: "The team",
    body: "A five-person desk of ex-trading analysts, a sports data scientist, and two full-time football scouts. Between us we have 20+ years modelling match outcomes and reading team news before it moves a line.",
  },
  {
    icon: Database,
    title: "Statistical data models",
    body: "Every pick starts from an xG / xGA base model fed by shot quality, set-piece volume, lineup strength, travel and rest days, and referee tendencies. Model prices are compared to the market; we only publish where our edge clears a fixed threshold.",
  },
  {
    icon: Wallet,
    title: "Disciplined bankroll management",
    body: "Flat-to-fractional staking, never chasing losses, and a hard daily exposure cap. The published stake on each ticket assumes a 100-unit bank — scale it to yours, and treat the 2-odds feature as one unit, not a jackpot.",
  },
];

const principles = [
  "One curated 2-odds ticket per day — no volume spam.",
  "Model confidence and full stat reasoning shown on every free pick.",
  "Results settled publicly, wins and losses alike, in the archive.",
  "No guaranteed-win claims. Variance is real and we say so.",
];

export default function AboutPage() {
  const record = performance(getEditions());

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <LineChart className="size-3.5" aria-hidden />
            About us
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Predictions built on data, published with discipline
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            2Odds Football Prediction is a small analytics desk that turns a
            statistical match model into one hand-checked 2-odds ticket every
            day, plus a wider free and VIP feed across Europe&rsquo;s top
            leagues.
          </p>
          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
              <dt className="sr-only">Record</dt>
              <dd>
                {record.won}/{record.settled} settled &middot;{" "}
                {record.strikeRatePct}% strike rate
              </dd>
            </div>
          </dl>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {credentials.map((c) => (
            <article
              key={c.title}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <c.icon className="size-6 text-emerald-500" aria-hidden />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {c.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {c.body}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            How we work
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {principles.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-emerald-500"
                  aria-hidden
                />
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-start gap-4 rounded-2xl bg-zinc-900 p-6 sm:p-8 dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-white">See the method in action</h2>
          <p className="max-w-xl text-sm text-zinc-300">
            Today&rsquo;s free ticket and the full settled history are public.
            Check the record before you decide.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Today&rsquo;s picks <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Pick archive
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
