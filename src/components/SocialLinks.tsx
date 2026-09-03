import { cn } from "@/lib/utils";
import { SOCIAL_LINKS, type SocialLink } from "@/data/site";

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    fill: "currentColor",
  } as const;

  switch (icon) {
    case "telegram":
      return (
        <svg {...common}>
          <path d="M21.94 4.9 18.72 19.1c-.24 1.07-.88 1.34-1.78.83l-4.92-3.63-2.37 2.29c-.26.26-.48.48-.99.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.62-.2L4.65 12.9l-4.86-1.52c-1.06-.33-1.08-1.06.22-1.57L20.57 3.35c.88-.33 1.65.2 1.37 1.55Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.48l7.73-8.84L1.06 2.25h6.82l4.71 6.23 5.65-6.23Zm-1.16 17.52h1.84L7.02 4.13H5.05l12.03 15.64Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export interface SocialLinksProps {
  className?: string;
  /** Show the @handle next to each icon (footer style). */
  withHandles?: boolean;
  iconClassName?: string;
}

export function SocialLinks({
  className,
  withHandles = false,
  iconClassName,
}: SocialLinksProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {SOCIAL_LINKS.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.name}${s.handle ? ` (${s.handle})` : ""}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400",
              withHandles
                ? "px-1 py-1 text-sm"
                : "size-9 justify-center border border-zinc-200 hover:border-emerald-500 dark:border-zinc-800",
              iconClassName,
            )}
          >
            <SocialIcon icon={s.icon} />
            {withHandles && <span>{s.handle}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialLinks;
