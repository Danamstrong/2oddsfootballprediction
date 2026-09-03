"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Shows a ticking clock and refreshes the server feed on an interval. */
export function MatchdayClock({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    const refresh = setInterval(() => router.refresh(), intervalMs);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [router, intervalMs]);

  return (
    <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
      <span className="tabular-nums">
        {now
          ? now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "--:--:--"}
      </span>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-800 dark:text-zinc-300"
      >
        <RefreshCw className="size-3.5" aria-hidden />
        Refresh
      </button>
    </div>
  );
}

export default MatchdayClock;
