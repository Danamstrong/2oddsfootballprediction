import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type DbPredictionCategory = "free" | "vip";
export type DbPredictionStatus = "Pending" | "WON" | "LOSS";

/** One row from the live `predictions` table, written by /admin/dashboard. */
export interface DbPrediction {
  id: string;
  match_name: string;
  pick: string;
  odds: number;
  category: DbPredictionCategory;
  date: string;
  status: DbPredictionStatus;
}

/** Every free pick, newest first. */
export async function getFreePredictions(): Promise<DbPrediction[]> {
  const { data, error } = await supabaseAdmin()
    .from("predictions")
    .select("*")
    .eq("category", "free")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Pending (unsettled) VIP picks, newest first — the only VIP pick data ever
 * sent to a client, and only once the caller has already confirmed active
 * VIP status (see /vip and /api/vip-picks).
 */
export async function getPendingVipPredictions(): Promise<DbPrediction[]> {
  const { data, error } = await supabaseAdmin()
    .from("predictions")
    .select("*")
    .eq("category", "vip")
    .eq("status", "Pending")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Settled VIP picks (won or lost), newest first — powers /archive. */
export async function getSettledVipPredictions(): Promise<DbPrediction[]> {
  const { data, error } = await supabaseAdmin()
    .from("predictions")
    .select("*")
    .eq("category", "vip")
    .in("status", ["WON", "LOSS"])
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
