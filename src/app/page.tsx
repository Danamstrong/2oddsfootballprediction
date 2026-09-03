import Link from "next/link";
import { ShieldCheck, BarChart3, Bell, Lock, Crown } from "lucide-react";
import { DailyTicket } from "@/components/DailyTicket";
import { PredictionCard } from "@/components/PredictionCard";
import { HistoricalPicksFeed, type FeedDay } from "@/components/HistoricalPicksFeed";
import { MultiCurrencyPayButton } from "@/components/MultiCurrencyPayButton";
import { RestoreAccessForm } from "@/components/RestoreAccessForm";
import { Testimonials } from "@/components/Testimonials";
import { LiveStatusBanner } from "@/components/LiveStatusBanner";
import {
  formatEditionDate,
  getCurrentEdition,
  getEditions,
  performance,
} from "@/lib/predictions";
import { readVipAccess } from "@/lib/vip-access";

export default async function Home() {
  const edition = getCurrentEdition();
  const editionsNewestFirst = getEditions();
  const record = performance(editionsNewestFirst);
  const vipAccess = await readVipAccess();
  const isVipActive = Boolean(vipAccess);

  // Build the 3-day historical toggle: the current edition and the two before
  // it. Each day contributes up to 6 rows (free + VIP picks, interleaved).
  const currentIndex = Math.max(
    0,
    editionsNewestFirst.findIndex((e) => e.date === edition.date),
  );
  const feedDays: FeedDay[] = ["Today", "Yesterday", "2 Days Ago"].map(
    (label, offset) => {
      const day = editionsNewestFirst[currentIndex + offset];
      return {
        label,
        dateLabel: day ? formatEditionDate(day.date) : null,
        rows: day ? [...day.free, ...day.vip].slice(0, 6) : [],
      };
    },
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-14 sm:px-6 sm:py-20">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <BarChart3 className="size-3.5" aria-hidden />
            Data-driven football predictions
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            2Odds Football Prediction
          </h1>
          <p className="max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            A hand-built 2-odds ticket every day, plus statistically modelled
            match picks across Europe&rsquo;s top leagues.
          </p>

          <LiveStatusBanner />

          <dl className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
              <dt className="sr-only">Record</dt>
              <dd>
                {record.won}/{record.settled} settled &middot;{" "}
                {record.strikeRatePct}% strike rate
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Bell className="size-4 text-emerald-500" aria-hidden />
              <dt className="sr-only">Timing</dt>
              <dd>Posted by 10:00 daily</dd>
            </div>
          </dl>
        </section>

        {/* Daily 2-Odds Feature ticket */}
        <DailyTicket slip={edition.feature} editionDate={edition.date} />

        {/* Free match picks — 6 interleaved rows, ad-locked for non-VIP */}
        <HistoricalPicksFeed days={feedDays} isVipActive={isVipActive} />

        {/* VIP picks — unlocked for members, locked teaser otherwise */}
        {edition.vip.length > 0 && (
          <section aria-labelledby="vip-picks-heading" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2
                id="vip-picks-heading"
                className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
              >
                VIP picks
              </h2>
              {vipAccess && (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  VIP active
                </p>
              )}
            </div>

            {vipAccess ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {edition.vip.map((pick) => (
                  <PredictionCard key={pick.id} pick={pick} />
                ))}
              </div>
            ) : (
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none grid select-none gap-5 blur-sm sm:grid-cols-2 lg:grid-cols-3"
                >
                  {edition.vip.map((pick) => (
                    <PredictionCard key={pick.id} pick={pick} />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 text-center backdrop-blur-[2px] dark:bg-black/60">
                  <Lock className="size-6 text-emerald-500" aria-hidden />
                  <p className="max-w-xs text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {edition.vip.length} VIP picks
                    {edition.vipFeature ? " + VIP banker builder" : ""} locked.
                  </p>
                  <Link
                    href="#vip-heading"
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                  >
                    Unlock with VIP
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VIP membership checkout — multi-currency */}
        <section
          aria-labelledby="vip-heading"
          className="flex flex-col items-center gap-8"
        >
          <div className="text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Crown className="size-3.5" aria-hidden />
              VIP Membership
            </p>
            <h2
              id="vip-heading"
              className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
            >
              Unlock every premium pick
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Full VIP feed, staking plans, and early team news. Pick your country
              and currency — secure checkout by Flutterwave.
            </p>
          </div>

          <MultiCurrencyPayButton />
          {!vipAccess && <RestoreAccessForm />}
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Responsible gambling */}
        <p className="border-t border-zinc-200 pt-8 text-center text-xs leading-relaxed text-zinc-400 dark:border-zinc-800">
          Predictions are opinions based on statistical models and carry no
          guarantee. Betting involves risk &mdash; never stake more than you can
          afford to lose. 18+. If gambling is affecting you, seek support.
        </p>
      </main>
    </div>
  );
}
