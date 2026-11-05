/**
 * Prediction data model + helpers.
 *
 * Fetches dynamic predictions from Supabase with fallbacks to `src/data/editions.ts`.
 */

import { editions as staticEditions } from "@/data/editions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  excludeFreeFromRecord?: boolean;
}

// --- Dynamic Database Fetching ------------------------------------------

/** Fetches rows from Supabase `predictions` table and merges with static editions. */
export async function fetchLiveEditions(): Promise<Edition[]> {
  try {
    const { data: rows, error } = await supabase
      .from('predictions')
      .select('*')
      .order('date', { ascending: false });

    if (error || !rows || rows.length === 0) {
      return getEditions(); // Fallback to static editions
    }

    // Group Supabase prediction rows into Edition objects by date
    const editionsMap: Record<string, Edition> = {};

    for (const row of rows) {
      const date = row.date;
      if (!editionsMap[date]) {
        editionsMap[date] = {
          date: date,
          headline: `Predictions for ${date}`,
          feature: {
            title: "Daily 2-Odds Feature",
            stake: 5000,
            selections: [],
          },
          free: [],
          vip: [],
        };
      }

      // Convert DB status ('WON', 'LOSS', 'Pending') to lowercase types expected by frontend
      let formattedStatus: PickStatus = "pending";
      if (row.status?.toLowerCase() === "won") formattedStatus = "won";
      if (row.status?.toLowerCase() === "loss" || row.status?.toLowerCase() === "lost") formattedStatus = "lost";

      const [homeTeam, awayTeam] = (row.match_name || "Home vs Away").split(" vs ");

      const pickObj: MatchPick = {
        id: row.id?.toString() || `${date}-${row.category}-${Math.random()}`,
        league: row.league || "Premier League",
        kickoff: `${date}T15:00:00Z`,
        home: homeTeam || "Home",
        away: awayTeam || "Away",
        market: "Match Pick",
        selection: row.pick || "1X",
        odds: Number(row.odds) || 1.85,
        confidence: 85,
        status: formattedStatus,
        analysis: "Data-driven statistical selection.",
      };

      if (row.category === "free") {
        editionsMap[date].free.push(pickObj);
        editionsMap[date].feature.selections.push(pickObj);
      } else if (row.category === "vip") {
        editionsMap[date].vip.push(pickObj);
      }
    }

    const liveEditions = Object.values(editionsMap);
    
    // Merge live DB editions with existing static fallback data
    const allDates = new Set([...liveEditions.map(e => e.date), ...staticEditions.map(e => e.date)]);
    const merged: Edition[] = [];

    for (const d of Array.from(allDates)) {
      const live = liveEditions.find(e => e.date === d);
      const staticEd = staticEditions.find(e => e.date === d);
      if (live) {
        merged.push(live);
      } else if (staticEd) {
        merged.push(staticEd);
      }
    }

    return merged.sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error("Error fetching live editions:", err);
    return getEditions();
  }
}

// --- Static Fallbacks & Helpers ------------------------------------------

/** All static editions, newest first. */
export function getEditions(): Edition[] {
  return [...staticEditions].sort((a, b) => b.date.localeCompare(a.date));
}

export function getEdition(date: string): Edition | undefined {
  return staticEditions.find((e) => e.date === date);
}

export function getLatestEdition(): Edition {
  const all = getEditions();
  if (all.length === 0) {
    throw new Error("No editions published.");
  }
  return all[0];
}

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

export function allPicks(edition: Edition): MatchPick[] {
  return [
    ...edition.feature.selections,
    ...edition.free,
    ...edition.vip,
    ...(edition.vipFeature?.selections ?? []),
  ];
}

// --- Historical Archive ----------------------------------

export interface ArchiveRow {
  id: string;
  date: string;
  home: string;
  away: string;
  league: string;
  country?: string;
  odds: number;
  result: "won" | "lost";
}

export function getArchiveRows(list: Edition[] = getEditions()): ArchiveRow[] {
  return list
    .flatMap((edition) =>
      edition.vip
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

// --- Odds & Settlement -------------------------------------------------

export function combinedOdds(selections: Pick<MatchPick, "odds">[]): number {
  return selections.reduce((acc, s) => acc * s.odds, 1);
}

export function potentialReturn(
  stake: number,
  selections: Pick<MatchPick, "odds">[],
): number {
  return stake * combinedOdds(selections);
}

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

export function performance(list: Edition[] = getEditions()): Performance {
  const picks = list
    .flatMap((edition) => [
      ...(edition.excludeFreeFromRecord ? [] : edition.free),
      ...edition.vip,
    ])
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

export function formatShortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
}

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

// --- VIP Membership Tiers ----------------------------------

export interface VipTier {
  id: string;
  name: string;
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
