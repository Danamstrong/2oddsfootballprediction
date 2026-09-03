"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

const WIDGET_SRC = "https://www.livescore.bz/v2/widget/";

/**
 * Embeds the Livescore.bz / BZScore real-time football widget with a loading
 * state and a fixed-height responsive container so there's no layout shift
 * while the iframe boots.
 */
export function LiveScoreWidget() {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setTimedOut(true), 12_000);
    return () => clearTimeout(t);
  }, [loaded]);

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        style={{ minHeight: "600px" }}
      >
        {!loaded && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950"
            role="status"
          >
            <Loader2
              className="size-6 animate-spin text-emerald-500"
              aria-hidden
            />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {timedOut
                ? "The live score feed is taking a while to load…"
                : "Loading live scores…"}
            </p>
            {timedOut && (
              <a
                href={WIDGET_SRC}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                Open live scores
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        )}

        <iframe
          src={WIDGET_SRC}
          title="Football Live Scores"
          onLoad={() => setLoaded(true)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full"
          style={{ border: "none", width: "100%", height: "800px", minHeight: "600px" }}
        />
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        Live scores provided by{" "}
        <a
          href="https://www.livescore.bz/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Livescore.bz
        </a>
        . If the feed doesn&rsquo;t load, open it in a new tab.
      </p>
    </div>
  );
}

export default LiveScoreWidget;
