import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10b981",
          color: "#ffffff",
          fontSize: 150,
          fontWeight: 900,
          fontFamily: "sans-serif",
          borderRadius: 56,
        }}
      >
        2+
      </div>
    ),
    { ...size },
  );
}
