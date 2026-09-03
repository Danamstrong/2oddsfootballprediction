"use client";

import { useEffect, useId, useState } from "react";
import { Info, X } from "lucide-react";

/** The 4-tier weighting model behind every confidence score. */
const FACTORS: { label: string; weight: number; blurb: string }[] = [
  {
    label: "Form",
    weight: 35,
    blurb:
      "Recent results, xG / xGA trends and scoring rate over the last 6–10 matches, home and away split out.",
  },
  {
    label: "Lineups",
    weight: 25,
    blurb:
      "Confirmed or projected XI, injuries, suspensions and rotation risk versus each team's strongest available side.",
  },
  {
    label: "Market Movement",
    weight: 25,
    blurb:
      "How the opening price has drifted or shortened across major books — a proxy for sharp money and late information.",
  },
  {
    label: "Match Context",
    weight: 15,
    blurb:
      "Fixture congestion, motivation, travel, weather, referee tendencies and head-to-head patterns.",
  },
];

export function ConfidenceModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 underline decoration-dotted underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        <Info className="size-3" aria-hidden />
        How confidence is calculated
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id={titleId}
                className="text-base font-bold text-zinc-900 dark:text-zinc-50"
              >
                How confidence is calculated
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Every pick is scored 0–100 by a weighted model. Four factor groups
              feed the number:
            </p>

            <dl className="mt-4 flex flex-col gap-4">
              {FACTORS.map((f) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {f.label}
                    </dt>
                    <dd className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {f.weight}%
                    </dd>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${f.weight}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {f.blurb}
                  </p>
                </div>
              ))}
            </dl>

            <p className="mt-5 border-t border-zinc-200 pt-4 text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-800">
              Weights are fixed across all markets. A higher score means the model
              sees more agreement between factors — it is not a guarantee, and
              every bet carries risk.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfidenceModal;
