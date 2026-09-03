import type { ReactNode } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { SUPPORT_EMAIL } from "@/data/site";

export interface LegalLayoutProps {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}

export function LegalLayout({ title, updated, intro, children }: LegalLayoutProps) {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Scale className="size-3.5" aria-hidden />
            Legal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {updated}
          </p>
          <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {intro}
          </div>
        </header>

        <div className="flex flex-col gap-8">{children}</div>

        <p className="border-t border-zinc-200 pt-6 text-xs leading-relaxed text-zinc-400 dark:border-zinc-800">
          Questions about this document? Email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          . See also our <Link href="/terms" className="underline">Terms of Service</Link>{" "}
          and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-3">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-zinc-400">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export default LegalLayout;
