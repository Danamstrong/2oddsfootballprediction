import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Lightweight signed cookie that marks a browser as having active VIP access.
 * Not a full session system — it just lets the server unblur the VIP picks
 * immediately after a verified payment. Replace with real membership lookup
 * once `verify/route.ts` persists memberships.
 */

export const VIP_COOKIE = "vip_access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 31; // ~1 month

export interface VipAccess {
  tier: string;
  email: string | null;
  txRef: string;
  /** Expiry, epoch seconds. */
  exp: number;
}

function secret(): string {
  return process.env.FLW_SECRET_KEY ?? "insecure-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function encodeVipAccess(
  access: Omit<VipAccess, "exp"> & { exp?: number },
): string {
  const full: VipAccess = {
    ...access,
    exp: access.exp ?? Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeVipAccess(token: string | undefined | null): VipAccess | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, sign(payload))) return null;

  let parsed: VipAccess;
  try {
    parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as VipAccess;
  } catch {
    return null;
  }
  if (typeof parsed.exp !== "number" || parsed.exp * 1000 < Date.now()) {
    return null;
  }
  return parsed;
}

export function vipCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Read + verify the current browser's VIP access (Server Components / handlers). */
export async function readVipAccess(): Promise<VipAccess | null> {
  const store = await cookies();
  return decodeVipAccess(store.get(VIP_COOKIE)?.value);
}
