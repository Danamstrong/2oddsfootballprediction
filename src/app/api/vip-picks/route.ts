import { NextResponse } from "next/server";
import { getViewerVipStatus } from "@/lib/vip-status";
import { getCurrentEdition } from "@/lib/predictions";

/**
 * The only place VIP pick data leaves the server for a real client fetch.
 * Session + subscription state are re-checked on every request — nothing
 * here is cached or trusted from the client.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { isVip } = await getViewerVipStatus();

  if (!isVip) {
    return NextResponse.json(
      { error: "Active VIP subscription required" },
      { status: 401 },
    );
  }

  const edition = getCurrentEdition();
  return NextResponse.json({
    date: edition.date,
    picks: edition.vip,
  });
}
