import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import {
  LEGAL_LINKS,
  NAV_LINKS,
  RESPONSIBLE_GAMBLING_RESOURCES,
  SITE_NAME,
  SUPPORT_EMAIL,
} from "@/data/site";
import { SocialLinks } from "@/components/SocialLinks";

const linkCls =
  "text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400";
const headingCls =
  "text-xs font-semibold uppercase tracking-wide text-zinc-400";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-sm font-black leading-none tracking-tight text-white">
              2+
            </span>
            {SITE_NAME}
          </span>
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            Data-driven football predictions and a hand-built 2-odds ticket every
            day. Statistical opinion, not financial advice.
          </p>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border-2 border-rose-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            <span className="grid size-5 place-items-center rounded bg-rose-500 text-[11px] font-black text-white">
              18+
            </span>
            Strictly 18 and over
          </span>
          <SocialLinks className="mt-1" />
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2">
          <h2 className={headingCls}>Site</h2>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls}>
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <h2 className={headingCls}>Legal</h2>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls}>
              {l.name}
            </Link>
          ))}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={`inline-flex items-center gap-2 ${linkCls}`}
          >
            <Mail className="size-4" aria-hidden />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className={headingCls}>Gambling support</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            If betting stops being fun, these independent services can help:
          </p>
          {RESPONSIBLE_GAMBLING_RESOURCES.map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 font-medium ${linkCls}`}
            >
              {r.name}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-6 text-center text-xs leading-relaxed text-zinc-400 sm:px-6 dark:border-zinc-800">
        <p>
          &copy; {year} {SITE_NAME}. Predictions are statistical opinions with no
          guarantee of profit and are provided for entertainment. You must be 18+
          to use this site. Never stake more than you can afford to lose. If
          gambling is affecting you, contact{" "}
          <a
            href="https://www.begambleaware.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            BeGambleAware
          </a>{" "}
          or{" "}
          <a
            href="https://www.gamblingtherapy.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Gambling Therapy
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
