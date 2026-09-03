/**
 * Static blog content. Add a post by appending to `posts` below — the listing,
 * post pages, sitemap and RSS all read from here.
 */

export type BlogCategory = "Strategy Guide" | "Match Preview";

export interface BlogBlock {
  type: "p" | "h2" | "ul";
  /** For `p` / `h2`. */
  text?: string;
  /** For `ul`. */
  items?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  author: string;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** ISO date; defaults to publishedAt. */
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  body: BlogBlock[];
}

const posts: BlogPost[] = [
  {
    slug: "what-2-odds-staking-actually-looks-like",
    title: "What a Disciplined 2-Odds Staking Plan Actually Looks Like",
    description:
      "A 2-odds ticket is not a jackpot. Here is how to size stakes, set a stop-loss, and treat the daily slip as one unit of a longer plan.",
    category: "Strategy Guide",
    author: "2Odds Analytics Desk",
    publishedAt: "2026-08-20",
    updatedAt: "2026-09-01",
    readingMinutes: 6,
    tags: ["staking", "bankroll", "2 odds", "discipline"],
    body: [
      {
        type: "p",
        text: "Most people who lose money following prediction services do not lose it because the picks are bad. They lose it because the staking is bad — doubling up after a red day, putting a week's bankroll on one accumulator, or treating a 2.0 shot as if it were a coin flip they are owed.",
      },
      { type: "h2", text: "Start from a unit, not a naira figure" },
      {
        type: "p",
        text: "Decide what your total betting bankroll is — the amount you could lose entirely without it affecting your life. One unit is 1-2% of that. The daily 2-odds ticket is one unit. That is the whole rule. A 50,000 bankroll means a 500-1,000 stake per day, not 5,000 because you feel confident.",
      },
      { type: "h2", text: "Why flat staking beats chasing" },
      {
        type: "ul",
        items: [
          "At 2.0 average odds you need roughly a 50%+ strike rate to break even before margin. Real edges are small and slow.",
          "Chasing losses increases variance exactly when your bankroll can least absorb it.",
          "Flat staking makes a losing run survivable and a winning run compound gently.",
        ],
      },
      { type: "h2", text: "Set a stop-loss and a stop-win" },
      {
        type: "p",
        text: "Pick a number of consecutive losing days (three is common) after which you stop for the week and review. Do the same on the upside: bank a portion of profit rather than rolling all of it. The goal is to still be betting in six months, not to be right tomorrow.",
      },
      {
        type: "p",
        text: "None of this guarantees profit. Predictions are statistical opinions and variance is real — only stake what you can afford to lose.",
      },
    ],
  },
  {
    slug: "reading-expected-goals-without-fooling-yourself",
    title: "Reading Expected Goals (xG) Without Fooling Yourself",
    description:
      "xG is the most useful public stat for match analysis and the easiest to misuse. A practical guide to sample size, game state, and finishing noise.",
    category: "Strategy Guide",
    author: "2Odds Analytics Desk",
    publishedAt: "2026-08-27",
    readingMinutes: 7,
    tags: ["xG", "expected goals", "match analysis", "models"],
    body: [
      {
        type: "p",
        text: "Expected goals estimates how many goals an average team would score from the chances created. It is a better guide to underlying performance than the scoreline — but only if you respect its limits.",
      },
      { type: "h2", text: "Sample size first" },
      {
        type: "p",
        text: "A single match of xG tells you very little. Six to ten matches start to be meaningful. Early in a season, weight last season's numbers heavily and treat the first month as noise.",
      },
      { type: "h2", text: "Adjust for game state" },
      {
        type: "p",
        text: "A team that goes 2-0 up after 20 minutes will often sit back and concede chances, inflating the opponent's xG and suppressing its own. Look at xG while the game was level, not the raw totals, when you can get it.",
      },
      { type: "h2", text: "Separate creation from finishing" },
      {
        type: "ul",
        items: [
          "Persistently out-finishing xG is rare and usually regresses.",
          "A team under-performing its xG over 10+ games is often a value backing opportunity — the chances are there.",
          "Penalties distort per-shot xG; check whether a spike is just spot-kicks.",
        ],
      },
      {
        type: "p",
        text: "Our models use xG and xGA as a base and layer on lineup strength, rest, travel and set-piece volume before any pick is published.",
      },
    ],
  },
  {
    slug: "matchday-preview-top-five-leagues-week-opener",
    title: "Matchday Preview: What the Models Like in the Week's Openers",
    description:
      "A walk through the fixtures our models flag across the Premier League, La Liga, Serie A, Bundesliga and Ligue 1 — and the ones to leave alone.",
    category: "Match Preview",
    author: "2Odds Analytics Desk",
    publishedAt: "2026-08-30",
    readingMinutes: 5,
    tags: ["preview", "premier league", "la liga", "serie a"],
    body: [
      {
        type: "p",
        text: "This is a walk-through of how the desk reads a matchday, not a set of tips. The published picks live on the homepage and the VIP feed.",
      },
      { type: "h2", text: "Where the model sees an edge" },
      {
        type: "p",
        text: "Home sides with a strong level-state xG differential facing opponents on a short rest cycle are the classic model favourites. Two of this week's early kickoffs fit that shape, and both land in low-variance markets — team totals and double chance rather than correct score.",
      },
      { type: "h2", text: "Where to stay out" },
      {
        type: "ul",
        items: [
          "Derbies with congested midfields — high red-card and low-scoring risk that priced markets already reflect.",
          "Teams with a key striker listed as a late fitness test; wait for confirmed lineups.",
          "Any fixture where the model price and the market price are within a couple of percent — no edge, no bet.",
        ],
      },
      {
        type: "p",
        text: "Check the homepage on the day for the settled ticket and the reasoning behind each leg.",
      },
    ],
  },
  {
    slug: "why-we-publish-losing-picks",
    title: "Why We Publish Our Losing Picks",
    description:
      "A prediction service that only shows you its winners is selling something. Here is why the full settled record — reds included — sits in our public archive.",
    category: "Strategy Guide",
    author: "2Odds Analytics Desk",
    publishedAt: "2026-09-01",
    readingMinutes: 4,
    tags: ["transparency", "record", "archive"],
    body: [
      {
        type: "p",
        text: "Every settled single pick we publish goes into the archive with its result, win or lose. That is deliberate, and it is the single most important thing to check before trusting any tipster.",
      },
      { type: "h2", text: "Screenshots prove nothing" },
      {
        type: "p",
        text: "A cropped bet slip is trivial to fake and trivial to cherry-pick. A continuously updated, timestamped record that includes the losing days is much harder to fake and far more useful.",
      },
      { type: "h2", text: "What a healthy record looks like" },
      {
        type: "ul",
        items: [
          "Losing runs of three to five picks — normal at 2.0 odds, and present in any honest record.",
          "A strike rate that moves slowly and settles, rather than sitting suspiciously high.",
          "No missing days or quietly deleted picks.",
        ],
      },
      {
        type: "p",
        text: "Look at the archive, judge the process, and only stake what you can afford to lose.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
