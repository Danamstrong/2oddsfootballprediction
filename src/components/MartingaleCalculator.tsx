"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Layers, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrency,
} from "@/data/currencies";

const LOG2 = Math.LN2;

interface StepRow {
  step: number;
  bet: number;
  cumulativeInvestment: number;
  totalReturn: number;
  netProfit: number;
  exceedsBankroll: boolean;
}

function buildSteps(
  baseStake: number,
  targetOdds: number,
  maxSteps: number,
  bankroll: number,
): StepRow[] {
  const rows: StepRow[] = [];
  for (let step = 1; step <= maxSteps; step++) {
    const bet = baseStake * 2 ** (step - 1);
    const cumulativeInvestment = baseStake * (2 ** step - 1);
    const totalReturn = bet * targetOdds;
    const netProfit = totalReturn - cumulativeInvestment;
    rows.push({
      step,
      bet,
      cumulativeInvestment,
      totalReturn,
      netProfit,
      exceedsBankroll: cumulativeInvestment > bankroll,
    });
  }
  return rows;
}

export function MartingaleCalculator() {
  const [bankroll, setBankroll] = useState(50000);
  const [baseStake, setBaseStake] = useState(1000);
  const [targetOdds, setTargetOdds] = useState(2.0);
  const [maxSteps, setMaxSteps] = useState(5);
  const [currencyCode, setCurrencyCode] = useState("NGN");

  const currency = getCurrency(currencyCode) ?? SUPPORTED_CURRENCIES[0];
  const fmt = (n: number) => formatCurrency(currency, Math.round(n));

  const safeBaseStake = Math.max(1, baseStake);
  const safeBankroll = Math.max(0, bankroll);
  const safeOdds = Math.max(1.01, targetOdds);
  const safeMaxSteps = Math.min(15, Math.max(1, Math.round(maxSteps)));

  const totalStepsSupported = useMemo(
    () =>
      Math.max(
        0,
        Math.floor(
          Math.log(safeBankroll / safeBaseStake + 1) / LOG2,
        ),
      ),
    [safeBankroll, safeBaseStake],
  );

  const requiredBankrollForMaxSteps = useMemo(
    () => safeBaseStake * (2 ** safeMaxSteps - 1),
    [safeBaseStake, safeMaxSteps],
  );

  const riskOfBustingPct = useMemo(
    () => Math.pow(1 - 1 / safeOdds, totalStepsSupported) * 100,
    [safeOdds, totalStepsSupported],
  );

  const profitPerCycle = useMemo(
    () => safeBaseStake * (safeOdds - 1),
    [safeBaseStake, safeOdds],
  );

  const steps = useMemo(
    () => buildSteps(safeBaseStake, safeOdds, safeMaxSteps, safeBankroll),
    [safeBaseStake, safeOdds, safeMaxSteps, safeBankroll],
  );

  const bankrollCoversPlan = requiredBankrollForMaxSteps <= safeBankroll;

  return (
    <div className="flex flex-col gap-8">
      {/* Inputs */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950 p-5 text-zinc-100 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold sm:text-xl">Your numbers</h2>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            Currency
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm font-semibold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-zinc-900">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Total bankroll"
            value={bankroll}
            display={fmt(bankroll)}
            onChange={setBankroll}
            min={100}
            max={500000}
            step={100}
          />
          <Field
            label="Base stake (initial bet)"
            value={baseStake}
            display={fmt(baseStake)}
            onChange={setBaseStake}
            min={10}
            max={20000}
            step={10}
          />
          <Field
            label="Target odds"
            value={targetOdds}
            display={targetOdds.toFixed(2)}
            onChange={setTargetOdds}
            min={1.1}
            max={5}
            step={0.01}
          />
          <Field
            label="Max sequence steps"
            value={maxSteps}
            display={`${safeMaxSteps} loss${safeMaxSteps === 1 ? "" : "es"}`}
            onChange={setMaxSteps}
            min={1}
            max={10}
            step={1}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Layers className="size-4" aria-hidden />}
          label="Max consecutive losses covered"
          value={`${totalStepsSupported} Loss${totalStepsSupported === 1 ? "" : "es"}`}
          hint="What your current bankroll can actually survive."
        />
        <SummaryCard
          icon={<Percent className="size-4" aria-hidden />}
          label="Risk of busting sequence"
          value={`${riskOfBustingPct.toFixed(2)}%`}
          hint={`Chance of ${totalStepsSupported} losses in a row at these odds.`}
        />
        <SummaryCard
          icon={<TrendingUp className="size-4" aria-hidden />}
          label="Profit per completed series"
          value={fmt(profitPerCycle)}
          hint="Net gain once any step in the cycle wins."
          highlight
        />
      </div>

      {/* Required bankroll callout */}
      <div
        className={cn(
          "flex flex-col gap-1 rounded-2xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
          bankrollCoversPlan
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        )}
      >
        <span>
          Covering <strong>{safeMaxSteps}</strong> consecutive losses needs a
          bankroll of <strong>{fmt(requiredBankrollForMaxSteps)}</strong>.
        </span>
        <span className="font-semibold">
          {bankrollCoversPlan
            ? "Your bankroll covers this plan."
            : `Short by ${fmt(requiredBankrollForMaxSteps - safeBankroll)}.`}
        </span>
      </div>

      {/* Step breakdown table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">
          Step-by-step breakdown
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Step
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Bet amount
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Cumulative investment
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Total return if won
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Net profit on win
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((row) => (
                <tr
                  key={row.step}
                  className={cn(
                    "border-b border-zinc-100 last:border-0 dark:border-zinc-900",
                    row.exceedsBankroll &&
                      "bg-rose-50 dark:bg-rose-950/30",
                  )}
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                    {row.step}
                    {row.exceedsBankroll && (
                      <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                        Exceeds bankroll
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {fmt(row.bet)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {fmt(row.cumulativeInvestment)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                    {fmt(row.totalReturn)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-semibold tabular-nums",
                      row.netProfit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {row.netProfit >= 0 ? "+" : ""}
                    {fmt(row.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk warning */}
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
        <div className="flex flex-col gap-1.5">
          <p className="font-semibold">Martingale carries real ruin risk</p>
          <p className="leading-relaxed text-amber-800/90 dark:text-amber-200/80">
            This tool assumes odds stay fixed near {safeOdds.toFixed(2)} and
            that you double the stake exactly on every loss &mdash; real
            markets move, bookmakers limit stakes, and a single losing streak
            past your bankroll ends the sequence. Set a hard stop-loss before
            you start, never chase a blown sequence with money outside your
            bankroll, and treat the required-bankroll figure above as the
            most you should ever risk on one cycle. Past strike rates are not
            a guarantee of future results. 18+, gamble responsibly.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  display,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-right text-sm font-bold tabular-nums text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer touch-manipulation accent-emerald-500"
        aria-label={label}
      />
      <p className="text-right text-xs text-zinc-400">{display}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-extrabold tabular-nums",
          highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-50",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
    </div>
  );
}

export default MartingaleCalculator;
