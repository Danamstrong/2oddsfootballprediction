import Link from "next/link";
import { ShieldCheck, BarChart3, Bell, Lock } from "lucide-react";
import { DailyTicket } from "@/components/DailyTicket";
import { PredictionCard } from "@/components/PredictionCard";
import { VipPricing } from "@/components/VipPricing";
import {
  getCurrentEdition,
  getEditions,
  performance,
} from "@/lib/predictions";

export default function Home() {
  const edition = getCurrentEdition();
  const record = performance(getEditions());

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
        <DailyTicket slip={edition.feature} date={edition.date} />

        {/* Free match picks */}
        <section aria-labelledby="picks-heading" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2
              id="picks-heading"
              className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
            >
              Today&rsquo;s free picks
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {edition.free.length} free &middot; {edition.vip.length} more in VIP
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {edition.free.map((pick) => (
              <PredictionCard key={pick.id} pick={pick} />
            ))}
          </div>
        </section>

        {/* VIP picks — locked teaser */}
        {edition.vip.length > 0 && (
          <section aria-labelledby="vip-picks-heading" className="flex flex-col gap-6">
            <h2
              id="vip-picks-heading"
              className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
            >
              VIP picks
            </h2>
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
          </section>
        )}

        {/* VIP membership pricing */}
        <VipPricing />

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
