/** Site-wide constants: contact + social + navigation. */

export const SITE_NAME = "2Odds Football Prediction";
export const SITE_DOMAIN = "2oddsfootballprediction.com";
/** Canonical origin — no www, no trailing slash. */
export const SITE_URL = "https://2oddsfootballprediction.com";
export const SITE_LOGO_URL = `${SITE_URL}/icon`;
export const SUPPORT_EMAIL = "support@2oddsfootballprediction.com";

export const SITE_TAGLINE =
  "Daily Verified Sports Analytics & VIP Picks";

export interface SocialLink {
  name: string;
  /** One of the keys handled by <SocialIcon>. */
  icon: "telegram" | "x" | "instagram";
  href: string;
  handle: string;
}

// TODO: confirm the official handles/URLs before launch.
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Telegram",
    icon: "telegram",
    href: "https://t.me/twooddsfootballprediction",
    handle: "@twooddsfootballprediction",
  },
  {
    name: "Twitter / X",
    icon: "x",
    href: "https://x.com/2oddsfootball",
    handle: "@2oddsfootball",
  },
  {
    name: "Instagram",
    icon: "instagram",
    href: "https://instagram.com/2oddsfootballprediction",
    handle: "@2oddsfootballprediction",
  },
];

export interface NavLink {
  name: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { name: "Predictions", href: "/" },
  { name: "Live Scores", href: "/livescores" },
  { name: "Archive", href: "/archive" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const LEGAL_LINKS: NavLink[] = [
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

export interface ExternalResource {
  name: string;
  href: string;
  description: string;
}

/** Independent responsible-gambling support services. */
export const RESPONSIBLE_GAMBLING_RESOURCES: ExternalResource[] = [
  {
    name: "BeGambleAware",
    href: "https://www.begambleaware.org",
    description: "Free, confidential advice and support",
  },
  {
    name: "Gambling Therapy",
    href: "https://www.gamblingtherapy.org",
    description: "Global online support for anyone affected by gambling",
  },
];
