import Script from "next/script";

/**
 * Monetag publisher ad scripts.
 *
 * Monetag delivers one script tag per ad zone (format). Paste the exact `src`
 * URL from your Monetag dashboard (Sites → Zones) into the matching env var —
 * an unset var simply renders nothing, so the site stays clean until a zone is
 * live. If a zone snippet also needs a `data-zone` id, set the `*_ZONE` var too.
 *
 *   NEXT_PUBLIC_MONETAG_INPAGE_SRC    – In-Page Push zone script URL
 *   NEXT_PUBLIC_MONETAG_INPAGE_ZONE   – (optional) In-Page Push zone id
 *   NEXT_PUBLIC_MONETAG_ONCLICK_SRC   – OnClick / Popunder zone script URL
 *   NEXT_PUBLIC_MONETAG_ONCLICK_ZONE  – (optional) OnClick / Popunder zone id
 *   NEXT_PUBLIC_MONETAG_BANNER_SRC    – Banner / Vignette zone script URL
 *   NEXT_PUBLIC_MONETAG_BANNER_ZONE   – (optional) Banner / Vignette zone id
 *
 * All three load with the `afterInteractive` strategy: fetched after hydration,
 * asynchronously, so they never block first paint or interactivity.
 */

interface MonetagZone {
  id: string;
  src: string;
  zone?: string;
}

const ZONES: MonetagZone[] = [
  {
    id: "monetag-inpage-push",
    src: process.env.NEXT_PUBLIC_MONETAG_INPAGE_SRC ?? "",
    zone: process.env.NEXT_PUBLIC_MONETAG_INPAGE_ZONE,
  },
  {
    id: "monetag-onclick-popunder",
    src: process.env.NEXT_PUBLIC_MONETAG_ONCLICK_SRC ?? "",
    zone: process.env.NEXT_PUBLIC_MONETAG_ONCLICK_ZONE,
  },
  {
    id: "monetag-banner",
    src: process.env.NEXT_PUBLIC_MONETAG_BANNER_SRC ?? "",
    zone: process.env.NEXT_PUBLIC_MONETAG_BANNER_ZONE,
  },
].filter((z) => z.src !== "");

export function MonetagScripts() {
  if (ZONES.length === 0) return null;

  return (
    <>
      {ZONES.map((z) => (
        <Script
          key={z.id}
          id={z.id}
          src={z.src}
          strategy="afterInteractive"
          async
          data-cfasync="false"
          {...(z.zone ? { "data-zone": z.zone } : {})}
        />
      ))}
    </>
  );
}

export default MonetagScripts;
