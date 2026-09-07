import "server-only";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface VipStatus {
  isVip: boolean;
  expiresAt: string | null;
}

const NOT_VIP: VipStatus = { isVip: false, expiresAt: null };

/**
 * Look up whether `email` currently has active VIP access. Server-only —
 * queries `public.subscriptions` with the service-role key.
 *
 * This is the single source of truth for VIP status. It is written only by
 * the Flutterwave webhook (`/api/webhooks/flutterwave`) once a payment
 * settles — never by anything client-triggered.
 */
export async function getVipStatusByEmail(
  email: string | null | undefined,
): Promise<VipStatus> {
  if (!email) return NOT_VIP;

  const { data, error } = await supabaseAdmin()
    .from("subscriptions")
    .select("is_vip, vip_expires_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !data) return NOT_VIP;
  if (!data.is_vip) return NOT_VIP;
  if (!data.vip_expires_at) return NOT_VIP;
  if (new Date(data.vip_expires_at).getTime() <= Date.now()) return NOT_VIP;

  return { isVip: true, expiresAt: data.vip_expires_at };
}

/**
 * The current request's viewer: their NextAuth session (who they signed in
 * as) combined with a fresh VIP lookup (are they currently paid up). Both
 * checks happen server-side on every call — nothing here is cached client
 * state, so an expired or never-paid session always resolves to `isVip: false`.
 */
export async function getViewerVipStatus(): Promise<
  VipStatus & { email: string | null }
> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const status = await getVipStatusByEmail(email);
  return { ...status, email };
}
