import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  role?: string;
  quote: string;
}

/** Rating shown per review. */
const RATING = 7;

const REVIEWS: Review[] = [
  {
    name: "Ayomide",
    quote:
      "As an avid sports bettor, I’ve navigated countless prediction services, but none compare to 2OddsFootballPrediction.com. The daily 2-odds picks are meticulously analyzed... The VIP tier is worth every Naira!",
  },
  {
    name: "Queen Cindy",
    quote:
      "Before discovering 2OddsFootballPrediction.com, I often felt lost trying to make sense of sports betting... Since joining their VIP tier, my winnings have increased...",
  },
  {
    name: "Chukwuma",
    quote:
      "I can’t praise 2OddsFootballPrediction.com enough! The site delivers precise predictions daily... The 2-odds tickets are a brilliant idea.",
  },
  {
    name: "Emmanuel",
    role: "Football Betting Enthusiast",
    quote:
      "I can't believe the difference that 2OddsFootballPrediction.com has made to my betting strategy! Their daily 2-odds picks are impeccably researched...",
  },
  {
    name: "Yusuf Ola",
    role: "Sports Committed Bettor",
    quote:
      "As someone who loves football betting, I've tried numerous services, but none hold a candle to 2OddsFootballPrediction.com... Their VIP tier is a game changer!",
  },
];

function Stars() {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${RATING} out of ${RATING} stars`}
    >
      {Array.from({ length: RATING }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5 fill-amber-400 text-amber-400"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="flex flex-col gap-8">
      <div className="text-center">
        <h2
          id="testimonials-heading"
          className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50"
        >
          What members say
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Real feedback from bettors on the daily tickets and the VIP feed.
        </p>
      </div>

      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <li
            key={r.name}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <Stars />
              <Quote className="size-5 text-zinc-300 dark:text-zinc-700" aria-hidden />
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {r.quote}
            </blockquote>
            <footer className="mt-auto">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {r.name}
              </p>
              {r.role && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.role}</p>
              )}
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Testimonials;
