import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/data/site";

export const metadata: Metadata = {
  title: "Blog — Betting Strategy Guides & Match Previews",
  description:
    "Sports betting strategy guides, expected-goals explainers, staking discipline, and daily match previews from the 2Odds Football Prediction analytics desk.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: `Blog | ${SITE_NAME}`,
    description:
      "Betting strategy guides and match previews from the 2Odds analytics desk.",
  },
};

const categoryStyle: Record<string, string> = {
  "Strategy Guide":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "Match Preview":
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt ?? p.publishedAt,
      url: `${SITE_URL}/blog/${p.slug}`,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <JsonLd data={itemList} id="schema-blog" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <BookOpen className="size-3.5" aria-hidden />
            Blog
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Betting strategy guides &amp; match previews
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            How we build the models, how to stake with discipline, and what the
            desk is watching each matchday. No hype, no guaranteed-win claims.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide",
                      categoryStyle[post.category] ??
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                    )}
                  >
                    {post.category}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {formatPostDate(post.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Clock className="size-3.5" aria-hidden />
                    {post.readingMinutes} min read
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-600 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Read guide
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
