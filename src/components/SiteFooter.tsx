import Link from "next/link";
import { Mail } from "lucide-react";
import {
  NAV_LINKS,
  SITE_NAME,
  SUPPORT_EMAIL,
} from "@/data/site";
import { SocialLinks } from "@/components/SocialLinks";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-sm font-black leading-none tracking-tight text-white">
              2+
            </span>
            {SITE_NAME}
          </span>
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Data-driven football predictions and a hand-built 2-odds ticket every
            day. Bet responsibly — 18+.
          </p>
          <SocialLinks className="mt-1" />
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Site
          </h2>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Support
          </h2>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            <Mail className="size-4" aria-hidden />
            {SUPPORT_EMAIL}
          </a>
          <SocialLinks className="mt-1 flex-col !items-start" withHandles />
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-6 text-center text-xs leading-relaxed text-zinc-400 sm:px-6 dark:border-zinc-800">
        <p>
          &copy; {year} {SITE_NAME}. Predictions are statistical opinions with no
          guarantee of profit. Never stake more than you can afford to lose. If
          gambling is affecting you, seek support.
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
