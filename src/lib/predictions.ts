/**
 * Prediction data model + helpers.
 *
 * The actual daily content lives in `src/data/editions.ts` — edit that file to
 * publish a new day. Nothing in `src/app` or `src/components` needs touching:
 * pages read the latest edition through the helpers below.
 */

import { editions } from "@/data/editions";

// --- Model ---------------------------------------------------------------

export type PickStatus = "pending" | "won" | "lost" | "void" | "postponed";

/** Which audience a pick is published to. */
export type Audience = "free" | "vip";

export interface MatchPick {
  /** Stable unique id, e.g. "2026-09-02-epl-avl-tot". */
  id: string;
  league: string;
  country?: string;
  /** ISO 8601 kickoff timestamp in UTC. */
  kickoff: string;
  home: string;
  away: string;
  /** Betting market, e.g. "Over 1.5 Goals". */
  market: string;
  /** Selection within the market, e.g. "Yes" or "1X". */
  selection: string;
  odds: number;
  /** Model confidence, 0-100. */
  confidence: number;
  status: PickStatus;
  analysis: string;
}

/** A curated multi-selection slip (accumulator). */
export interface Slip {
  title: string;
  /** Recommended stake in NGN. */
  stake: number;
  selections: MatchPick[];
}

/** One day's published predictions. */
export interface Edition {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  headline?: string;
  /** The free "Daily 2-Odds Feature" slip. */
  feature: Slip;
  /** Additional free single picks. */
  free: MatchPick[];
  /** VIP-only single picks. */
  vip: MatchPick[];
  /** Optional VIP banker / accumulator slip. */
  vipFeature?: Slip;
}

// --- Edition access -----------------------------------------------------

/** All editions, newest first. */
export function getEditions(): Edition[] {
  return [...editions].sort((a, b) => b.date.localeCompare(a.date));
}

export function getEdition(date: string): Edition | undefined {
  return editions.find((e) => e.date === date);
}

/** Most recently dated edition. */
export function getLatestEdition(): Edition {
  const all = getEditions();
  if (all.length === 0) {
    throw new Error("No editions published. Add one to src/data/editions.ts.");
  }
  return all[0];
}

/**
 * The edition to show right now: the newest one whose date is not in the
 * future, falling back to the newest overall.
 */
export function getCurrentEdition(now: Date = new Date()): Edition {
  const today = now.toISOString().slice(0, 10);
  const all = getEditions();
  return all.find((e) => e.date <= today) ?? all[0];
}

export function getFreePicks(edition: Edition): MatchPick[] {
  return edition.free;
}

export function getVipPicks(edition: Edition): MatchPick[] {
  return edition.vip;
}

/** Every pick in an edition, across feature slip + free + vip + vipFeature. */
export function allPicks(edition: Edition): MatchPick[] {
  return [
    ...edition.feature.selections,
    ...edition.free,
    ...edition.vip,
    ...(edition.vipFeature?.selections ?? []),
  ];
}

// --- Historical archive (sanitised) ----------------------------------

/**
 * One settled result for the public archive. Deliberately omits `market`,
 * `selection`, `analysis` and `confidence` so the pattern behind our picks
 * can't be reverse-engineered from history.
 */
export interface ArchiveRow {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  home: string;
  away: string;
  league: string;
  country?: string;
  odds: number;
  result: "won" | "lost";
}

/** Every settled single pick, newest first, stripped to archive-safe fields. */
export function getArchiveRows(list: Edition[] = getEditions()): ArchiveRow[] {
  return list
    .flatMap((edition) =>
      [...edition.free, ...edition.vip]
        .filter((p) => p.status === "won" || p.status === "lost")
        .map((p) => ({
          id: p.id,
          date: edition.date,
          home: p.home,
          away: p.away,
          league: p.league,
          country: p.country,
          odds: p.odds,
          result: p.status as "won" | "lost",
        })),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.home.localeCompare(b.home));
}

// --- Odds & settlement -------------------------------------------------

export function combinedOdds(selections: Pick<MatchPick, "odds">[]): number {
  return selections.reduce((acc, s) => acc * s.odds, 1);
}

export function potentialReturn(
  stake: number,
  selections: Pick<MatchPick, "odds">[],
): number {
  return stake * combinedOdds(selections);
}

/** Aggregate status of a slip: lost if any leg lost, else pending if any leg
 *  pending, else won. Void and postponed legs are ignored. */
export function slipStatus(selections: Pick<MatchPick, "status">[]): PickStatus {
  const live = selections.filter(
    (s) => s.status !== "void" && s.status !== "postponed",
  );
  if (live.some((s) => s.status === "lost")) return "lost";
  if (live.some((s) => s.status === "pending")) return "pending";
  if (live.length === 0) return "void";
  return "won";
}

export interface Performance {
  settled: number;
  won: number;
  lost: number;
  strikeRatePct: number;
}

/**
 * Win record across a set of editions (settled single picks only).
 *
 * Deliberately excludes `feature`/`vipFeature` — those legs are duplicate
 * MatchPick objects for matches already published in `free`/`vip` (built
 * for the "Daily 2-Odds Feature" combo), so counting them too would settle
 * the same real-world result twice. `getArchiveRows` uses the same free +
 * vip pool for this reason.
 */
export function performance(list: Edition[] = getEditions()): Performance {
  const picks = list
    .flatMap((edition) => [...edition.free, ...edition.vip])
    .filter((p) => p.status === "won" || p.status === "lost");
  const won = picks.filter((p) => p.status === "won").length;
  const settled = picks.length;
  return {
    settled,
    won,
    lost: settled - won,
    strikeRatePct: settled === 0 ? 0 : Math.round((won / settled) * 100),
  };
}

// --- Formatting -------------------------------------------------------

export function formatKickoff(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(new Date(iso));
}

export function formatEditionDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Short form for tab labels, e.g. "5 Sep". Built manually rather than via
 * Intl — en-GB's short month for September is the 4-letter "Sept".
 */
export function formatShortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
}

/** The ISO date one day before the given ISO date. */
export function previousIsoDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- VIP membership (pricing config, not daily data) ------------------

export interface VipTier {
  id: string;
  name: string;
  /** Amount charged, in Nigerian Naira (Flutterwave `amount`). */
  amountNGN: number;
  cadence: string;
  blurb: string;
  features: string[];
  popular?: boolean;
}

export const vipTiers: VipTier[] = [
  {
    id: "weekly",
    name: "Weekly VIP",
    amountNGN: 5000,
    cadence: "/ week",
    blurb: "Try the full VIP feed for seven days.",
    features: [
      "Daily 2-odds VIP ticket",
      "3-5 extra premium picks per day",
      "Full stat breakdown per pick",
      "Telegram channel access",
    ],
  },
  {
    id: "monthly",
    name: "Monthly VIP",
    amountNGN: 15000,
    cadence: "/ month",
    blurb: "Best value for serious bettors.",
    popular: true,
    features: [
      "Everything in Weekly VIP",
      "Rollover & accumulator plans",
      "Early team-news alerts",
      "Priority support",
      "Loss-cover credit on red days",
    ],
  },
  {
    id: "season",
    name: "Season Pass",
    amountNGN: 35000,
    cadence: "/ 3 months",
    blurb: "Lock in the lowest weekly rate.",
    features: [
      "Everything in Monthly VIP",
      "1-on-1 staking-plan review",
      "Private high-odds weekend builds",
      "Locked pricing for renewals",
    ],
  },
];

export function getVipTier(id: string): VipTier | undefined {
  return vipTiers.find((t) => t.id === id);
}
