import Link from "next/link";
import { ShieldCheck, BarChart3, Bell, Crown, ArrowRight } from "lucide-react";
import { DailyTicket } from "@/components/DailyTicket";
import { LockedVipPreview } from "@/components/LockedVipPreview";
import { MultiCurrencyPayButton } from "@/components/MultiCurrencyPayButton";
import { Testimonials } from "@/components/Testimonials";
import { LiveStatusBanner } from "@/components/LiveStatusBanner";
import {
  combinedOdds,
  formatShortDate,
  getCurrentEdition,
  getEdition,
  getEditions,
  performance,
  previousIsoDate,
} from "@/lib/predictions";
import { getViewerVipStatus } from "@/lib/vip-status";

export default async function Home() {
  const edition = getCurrentEdition();
  const record = performance(getEditions());
  // Session + fresh DB subscription check — never a client-set cookie.
  const { isVip } = await getViewerVipStatus();

  // The 6 interleaved rows for the slip table: free picks first, then VIP.
  const rows = [...edition.free, ...edition.vip].slice(0, 6);
  const vipAccaOdds = combinedOdds(edition.vip);

  // The prior day's edition, if published, powers the "Yesterday" results tab.
  const yesterdayEdition = getEdition(previousIsoDate(edition.date));
  const yesterdayRows = yesterdayEdition
    ? [...yesterdayEdition.free, ...yesterdayEdition.vip].slice(0, 6)
    : [];

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

        {/* Daily 2-Odds slip — 6 interleaved rows, ad-locked for non-VIP */}
        <DailyTicket
          slip={edition.feature}
          rows={rows}
          todayLabel={formatShortDate(edition.date)}
          yesterdayRows={yesterdayRows}
          yesterdayLabel={yesterdayEdition ? formatShortDate(yesterdayEdition.date) : ""}
          isVipActive={isVip}
          editionDate={edition.date}
        />

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
              <div className="flex flex-wrap items-center gap-2">
                {edition.vip.length === 1 && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    Single value pick &middot; {edition.vip[0].odds.toFixed(2)} target odds
                  </p>
                )}
                {edition.vip.length > 1 && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    {edition.vip.length}-leg acca &middot; {vipAccaOdds.toFixed(2)} combined odds
                  </p>
                )}
                {isVip && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    VIP active
                  </p>
                )}
              </div>
            </div>

            {/*
              Real pick data (match, market, selection, odds, analysis) is
              never rendered here — not even blurred — for a non-VIP viewer.
              CSS blur still ships the underlying HTML, which is exactly the
              kind of leak this page used to have. VIP members are pointed at
              /vip, a Server Component that re-checks the session + Supabase
              subscription on every request before touching real pick data.
            */}
            {isVip ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
                <ShieldCheck className="size-6 text-emerald-500" aria-hidden />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Your VIP access is active &mdash; today&rsquo;s picks are ready.
                </p>
                <Link
                  href="/vip"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  View VIP picks
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <LockedVipPreview count={edition.vip.length} />
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
          {!isVip && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already paid?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Sign in to view your picks
              </Link>
            </p>
          )}
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
