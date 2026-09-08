#!/usr/bin/env node
/**
 * Generate the site's hero/blog feature images via the OpenArt AI API and
 * save them locally as WebP.
 *
 * Usage:
 *   OPENART_API_KEY=your_key node scripts/generate-images.js
 *
 * NOTE ON THE API CONTRACT: this script calls OpenArt's REST API at the
 * endpoint shape documented at https://docs.openart.ai (create a job, then
 * poll it). That docs host wasn't reachable from the environment this
 * script was written in, so the exact path/payload/response field names
 * below are unverified — confirm them against your OpenArt dashboard's API
 * reference before relying on this in CI. `openArtRequest()` and
 * `pollUntilDone()` are the only two places that would need adjusting; the
 * prompt list, download, and WebP-conversion steps are self-contained and
 * don't depend on that contract.
 *
 * Requires: `sharp` (already a project dependency) for the PNG/JPEG -> WebP
 * conversion step.
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API_BASE = "https://api.openart.ai/v1";
const API_KEY = process.env.OPENART_API_KEY;
const MODEL = process.env.OPENART_MODEL ?? "gpt-image-2";

if (!API_KEY) {
  console.error("Set OPENART_API_KEY before running this script.");
  process.exit(1);
}

/** One entry per image the site needs. Add more here as new pages need art. */
const JOBS = [
  {
    name: "hero-dashboard",
    outFile: "public/images/hero/dashboard.webp",
    prompt:
      "Futuristic sports analytics dashboard showing live football data, " +
      "clean dark mode UI, glowing green odds, photorealistic studio " +
      "lighting, 16:9 aspect ratio. Entirely fictional and generic: " +
      "invented team names, generic shield-shaped crests with no real " +
      "logos, no real player names or faces, no real league or club " +
      "branding of any kind.",
  },
  {
    name: "blog-strategy-guide",
    outFile: "public/images/blog/strategy-guide.webp",
    prompt:
      "3D digital rendered football stadium with statistical charts " +
      "hovering above the pitch, minimalist green lighting, 16:9 aspect " +
      "ratio. Fictional scoreboard and player names only, no real club " +
      "or league branding.",
  },
  {
    name: "blog-match-preview",
    outFile: "public/images/blog/match-preview.webp",
    prompt:
      "High resolution close up of tactical football whiteboard with " +
      "player movement arrows, modern sports analytics office " +
      "background, 16:9 aspect ratio.",
  },
];

/** Kick off one generation job. Adjust the path/body to match your API key's docs. */
async function openArtRequest(prompt) {
  const res = await fetch(`${API_BASE}/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      aspect_ratio: "16:9",
      num_images: 1,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenArt create-image failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  // Adjust this field name if your account's API returns the job id under a
  // different key (e.g. `id` instead of `historyId`).
  return data.historyId ?? data.id;
}

/** Poll a generation job until it completes, returning the final image URL. */
async function pollUntilDone(jobId, { intervalMs = 4000, timeoutMs = 180_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE}/generations/${jobId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) {
      throw new Error(`OpenArt status check failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    if (data.status === "COMPLETED") {
      const url = data.resources?.[0]?.url ?? data.imageUrl;
      if (!url) throw new Error(`No image URL on completed job ${jobId}`);
      return url;
    }
    if (data.status === "FAILED" || data.status === "CANCELLED") {
      throw new Error(`OpenArt job ${jobId} ${data.status}${data.error ? `: ${data.error}` : ""}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for OpenArt job ${jobId}`);
}

async function downloadAsWebp(url, outFile) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(buf).webp({ quality: 85 }).toBuffer();
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, webp);
}

async function main() {
  for (const job of JOBS) {
    console.log(`[${job.name}] submitting…`);
    const jobId = await openArtRequest(job.prompt);
    console.log(`[${job.name}] job ${jobId} running…`);
    const url = await pollUntilDone(jobId);
    console.log(`[${job.name}] downloading -> ${job.outFile}`);
    await downloadAsWebp(url, job.outFile);
    console.log(`[${job.name}] done`);
  }
  console.log("All images generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
