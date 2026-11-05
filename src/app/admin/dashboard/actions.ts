"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { OWNER_EMAIL } from "@/lib/owner";

/**
 * Re-checked on every call, independent of the page-level gate — a Server
 * Action is a public HTTP endpoint under the hood, so it must never trust
 * that the request came from the already-gated dashboard page.
 */
async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return (session?.user?.email?.toLowerCase() ?? null) === OWNER_EMAIL;
}

export interface SubmitPickInput {
  matchName: string;
  pick: string;
  odds: number;
  category: "free" | "vip";
  date: string;
  status: "Pending" | "WON" | "LOSS";
}

export async function submitPick(
  input: SubmitPickInput,
): Promise<{ error: string | null }> {
  if (!(await isAdmin())) {
    return { error: "Not authorized." };
  }

  const { error } = await supabaseAdmin().from("predictions").insert([
    {
      match_name: input.matchName,
      pick: input.pick,
      odds: input.odds,
      category: input.category,
      date: input.date,
      status: input.status,
    },
  ]);

  return { error: error?.message ?? null };
}

export interface SubmitBlogPostInput {
  title: string;
  content: string;
  imageUrl: string;
}

export async function submitBlogPost(
  input: SubmitBlogPostInput,
): Promise<{ error: string | null }> {
  if (!(await isAdmin())) {
    return { error: "Not authorized." };
  }

  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { error } = await supabaseAdmin().from("blog_posts").insert([
    {
      title: input.title,
      slug,
      content: input.content,
      image_url: input.imageUrl,
    },
  ]);

  return { error: error?.message ?? null };
}
