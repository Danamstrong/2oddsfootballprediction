"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/data/site";
import { SocialLinks } from "@/components/SocialLinks";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-sm font-black text-white">
            2O
          </span>
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(l.href)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks className="hidden sm:flex" />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 md:hidden dark:border-zinc-800 dark:text-zinc-300"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium",
                    isActive(l.href)
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "text-zinc-700 dark:text-zinc-300",
                  )}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
          <SocialLinks className="mt-3" withHandles />
        </nav>
      )}
    </header>
  );
}

export default SiteHeader;
