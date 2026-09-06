import type { Metadata } from "next";
import Link from "next/link";
import { Calculator as CalculatorIcon, ArrowRight } from "lucide-react";
import { MartingaleCalculator } from "@/components/MartingaleCalculator";

export const metadata: Metadata = {
  title: "Martingale Betting Calculator & Bankroll Strategy",
  description:
    "Calculate your required bankroll, base stake, and sequence risk for 2.00+ odds betting using our Martingale betting strategy calculator.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CalculatorIcon className="size-3.5" aria-hidden />
            Bankroll tool
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Martingale bankroll calculator
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Plug in your bankroll, base stake, and target odds to see exactly
            how many consecutive losses you can survive, how much a full
            losing sequence would cost, and the profit a single win clears.
            Built around 2.00+ odds &mdash; the range our daily ticket
            targets.
          </p>
        </header>

        <MartingaleCalculator />

        <section className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
            Need today&rsquo;s 2.00+ odds picks?
          </h2>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Run the numbers above, then grab the daily ticket our model built
            for exactly this odds range.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            See today&rsquo;s picks
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>
    </main>
  );
}
