import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import {
  getPost,
  getPostSlugs,
  getAllPosts,
  formatPostDate,
  type BlogBlock,
} from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/data/site";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "Post not found", robots: { index: false, follow: false } };
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {block.text}
      </h2>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300">
        {block.items?.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    );
  }
  return (
    <p className="text-zinc-700 dark:text-zinc-300">{block.text}</p>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [`${SITE_URL}/blog/${post.slug}/opengraph-image`],
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      "@id": `${SITE_URL}/#organization`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} id="schema-article" />

      <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-14 sm:px-6 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All posts
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {post.category}
            </span>
            <time dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {post.readingMinutes} min read
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            {post.title}
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            {post.description}
          </p>
          <p className="text-xs text-zinc-400">By {post.author}</p>
        </header>

        <div className="flex flex-col gap-4 text-sm leading-relaxed">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          This article is for information and entertainment only and is not
          betting or financial advice. 18+. Never stake more than you can afford
          to lose.
        </p>

        {related.length > 0 && (
          <section className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              More from the blog
            </h2>
            <ul className="flex flex-col gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
