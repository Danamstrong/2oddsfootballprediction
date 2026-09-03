"use client";

import { useCallback, useState } from "react";
import { Loader2, Send } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Fields {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string; // honeypot
}

const EMPTY: Fields = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";
const labelCls =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  const submit = useCallback(async () => {
    setError(null);
    setDone(null);

    if (fields.name.trim().length < 2) {
      setError("Please tell us your name.");
      return;
    }
    if (!EMAIL_RE.test(fields.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (fields.message.trim().length < 10) {
      setError("Please add a bit more detail to your message.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === "success") {
        setDone(data.message || "Thanks — your message has been sent.");
        setFields(EMPTY);
      } else {
        setError(data.message || "Could not send your message. Try again.");
      }
    } catch {
      setError("Network error — please try again in a moment.");
    } finally {
      setPending(false);
    }
  }, [fields]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className={labelCls}>
            Name
          </label>
          <input
            id="c-name"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label htmlFor="c-email" className={labelCls}>
            Email
          </label>
          <input
            id="c-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-subject" className={labelCls}>
          Subject <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          id="c-subject"
          value={fields.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="c-message" className={labelCls}>
          Message
        </label>
        <textarea
          id="c-message"
          rows={5}
          value={fields.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputCls} resize-y`}
          required
        />
      </div>

      {/* Honeypot: visually hidden, ignored by real users */}
      <div aria-hidden className="hidden">
        <label htmlFor="c-company">Company</label>
        <input
          id="c-company"
          tabIndex={-1}
          autoComplete="off"
          value={fields.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {pending ? "Sending…" : "Send message"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
        >
          {error}
        </p>
      )}
      {done && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          {done}
        </p>
      )}
    </form>
  );
}

export default ContactForm;
