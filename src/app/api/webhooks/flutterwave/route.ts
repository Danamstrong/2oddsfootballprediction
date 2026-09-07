import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { membershipExpiry, parseTxRef, resolveTier } from "@/lib/vip-membership";

/**
 * Flutterwave payment webhook — the ONLY thing that grants VIP access.
 *
 * Flutterwave calls this server-to-server after a payment settles. We never
 * trust a client-side "I paid" callback (see MultiCurrencyPayButton) — the
 * browser can fake that trivially. This endpoint is the trust boundary:
 *   1. The `verif-hash` header must match our configured secret.
 *   2. We re-verify the transaction directly with Flutterwave's API using
 *      the server-only secret key, rather than trusting the webhook body.
 *   3. Only then do we upsert the subscription record.
 *
 * Configure in the Flutterwave dashboard: Settings → Webhooks → set this
 * route's URL, and set the same "Secret Hash" value as
 * FLUTTERWAVE_SECRET_HASH here.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const verifyUrl = (id: string | number) =>
  `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(id))}/verify`;

interface FlwWebhookBody {
  event?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string };
  };
}

interface FlwVerifyResponse {
  status: string;
  data?: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    customer?: { email?: string };
    created_at?: string;
  };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const configuredHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!configuredHash) {
    console.error("[flutterwave webhook] FLUTTERWAVE_SECRET_HASH is not set.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const receivedHash = req.headers.get("verif-hash") ?? "";
  if (!receivedHash || !safeEqual(receivedHash, configuredHash)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: FlwWebhookBody;
  try {
    body = (await req.json()) as FlwWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Ack anything that isn't a settled charge — Flutterwave sends other event
  // types (transfers, refunds, etc.) to the same URL.
  if (body.event !== "charge.completed" || body.data?.status !== "successful") {
    return NextResponse.json({ status: "ignored" });
  }

  const transactionId = body.data.id;
  if (!transactionId) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  // Don't trust the webhook body's amount/status alone — re-verify
  // server-to-server with the secret key before crediting anything.
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    console.error("[flutterwave webhook] FLW_SECRET_KEY is not set.");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let verified: FlwVerifyResponse;
  try {
    const res = await fetch(verifyUrl(transactionId), {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    });
    verified = (await res.json()) as FlwVerifyResponse;
    if (!res.ok || verified.status !== "success" || !verified.data) {
      return NextResponse.json({ error: "Could not verify transaction" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Could not reach Flutterwave" }, { status: 502 });
  }

  const tx = verified.data;
  if (tx.status !== "successful") {
    return NextResponse.json({ status: "ignored" });
  }

  const email = tx.customer?.email?.trim().toLowerCase();
  if (!email) {
    console.error("[flutterwave webhook] settled transaction has no customer email", tx.tx_ref);
    return NextResponse.json({ error: "No customer email on transaction" }, { status: 422 });
  }

  const { tierId } = parseTxRef(tx.tx_ref);
  const tier = resolveTier(tierId);
  if (!tier) {
    console.error("[flutterwave webhook] could not resolve tier from tx_ref", tx.tx_ref);
    return NextResponse.json({ error: "Unknown plan for this transaction" }, { status: 422 });
  }

  const paidAtMs = tx.created_at ? Date.parse(tx.created_at) : NaN;
  const expiresAtSec = membershipExpiry(tier.id, Number.isNaN(paidAtMs) ? Date.now() : paidAtMs);
  const expiresAtIso = new Date(expiresAtSec * 1000).toISOString();

  const db = supabaseAdmin();

  const { data: user, error: userError } = await db
    .from("users")
    .upsert({ email }, { onConflict: "email" })
    .select("id")
    .single();
  if (userError) {
    console.error("[flutterwave webhook] failed to upsert user", userError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const { error: subError } = await db.from("subscriptions").upsert(
    {
      user_id: user.id,
      email,
      is_vip: true,
      vip_expires_at: expiresAtIso,
      flutterwave_tx_ref: tx.tx_ref,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (subError) {
    console.error("[flutterwave webhook] failed to upsert subscription", subError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
