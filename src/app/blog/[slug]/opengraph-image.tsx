import { ImageResponse } from "next/og";
import { getPost, getPostSlugs } from "@/lib/blog";
import { SITE_DOMAIN } from "@/data/site";

export const alt = "2Odds Football Prediction blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "2Odds Football Prediction Blog";
  const category = post?.category ?? "Blog";

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
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "#10b981",
              color: "#fff",
              fontSize: "40px",
              fontWeight: 900,
            }}
          >
            2+
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#34d399",
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "60px",
            fontWeight: 800,
            lineHeight: 1.12,
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: "26px", fontWeight: 600, color: "#a1a1aa" }}>
          {`${SITE_DOMAIN} — Verified Sports Analytics`}
        </div>
      </div>
    ),
    { ...size },
  );
}
