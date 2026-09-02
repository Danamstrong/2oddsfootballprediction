"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Already paid on another device?" — looks the email up against Flutterwave
 * via /api/auth/restore-access, which re-issues the VIP cookie on success.
 */
export function RestoreAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const restore = useCallback(async () => {
    setError(null);
    setNotice(null);
    if (!EMAIL_RE.test(email)) {
      setError("Enter the email you used at checkout.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/restore-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === "success") {
        setNotice("VIP access restored on this device — loading your picks…");
        router.refresh();
      } else {
        setError(data.message || "Could not restore access for that email.");
      }
    } catch {
      setError("Network error — try again in a moment.");
    } finally {
      setPending(false);
    }
  }, [email, router]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void restore();
      }}
      className="mx-auto w-full max-w-sm"
    >
      <label
        htmlFor="restore-email"
        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Already paid on another device? Restore access
      </label>
      <div className="flex gap-2">
        <input
          id="restore-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Mail className="size-4" aria-hidden />
          )}
          Restore
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-2 text-sm text-emerald-600 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
    </form>
  );
}

export default RestoreAccessForm;
