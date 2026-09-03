import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/data/site";

export const alt =
  "2+ 2Odds Football Prediction - Daily Verified Sports Analytics & VIP Picks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #052e1a 0%, #0a0a0a 55%, #0a0a0a 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "24px",
              background: "#10b981",
              color: "#ffffff",
              fontSize: "56px",
              fontWeight: 900,
            }}
          >
            2+
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#34d399",
            }}
          >
            {SITE_DOMAIN}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: "76px", fontWeight: 800, lineHeight: 1.05 }}>
            2Odds Football Prediction
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 600,
              color: "#a1a1aa",
              lineHeight: 1.2,
            }}
          >
            Daily Verified Sports Analytics &amp; VIP Picks
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "26px",
            fontWeight: 600,
            color: "#d4d4d8",
          }}
        >
          <span
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "9999px",
              border: "2px solid rgba(16,185,129,0.5)",
            }}
          >
            Daily 2-Odds Ticket
          </span>
          <span
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "9999px",
              border: "2px solid rgba(16,185,129,0.5)",
            }}
          >
            Statistical Models
          </span>
          <span
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "9999px",
              border: "2px solid rgba(16,185,129,0.5)",
            }}
          >
            Public Record
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
