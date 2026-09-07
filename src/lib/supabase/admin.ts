import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — full read/write, bypasses Row Level
 * Security. Server-only: never import this from a Client Component, and
 * never send `SUPABASE_SERVICE_ROLE_KEY` to the browser.
 *
 * Used by: the Flutterwave webhook (writes VIP status) and the protected
 * /vip page + /api/vip-picks route (reads VIP status). Nothing public-facing
 * touches this.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to access the database.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
