import {
  SITE_NAME,
  SITE_URL,
  SITE_LOGO_URL,
  SITE_TAGLINE,
  SOCIAL_LINKS,
} from "@/data/site";
import type { Slip } from "@/lib/predictions";

/** Organization + WebSite graph for the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
        },
        description: `${SITE_NAME} — ${SITE_TAGLINE}.`,
        sameAs: SOCIAL_LINKS.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/**
 * SportsEvent + OddsPrediction structure for a published slip. Each selection
 * becomes a SportsEvent whose `subjectOf` carries our prediction (market,
 * selection, odds, model confidence).
 */
export function predictionJsonLd(slip: Slip, editionDate: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${slip.title} — ${editionDate}`,
    numberOfItems: slip.selections.length,
    itemListElement: slip.selections.map((s, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsEvent",
        name: `${s.home} vs ${s.away}`,
        sport: "Association Football",
        startDate: s.kickoff,
        eventStatus: "https://schema.org/EventScheduled",
        homeTeam: { "@type": "SportsTeam", name: s.home },
        awayTeam: { "@type": "SportsTeam", name: s.away },
        superEvent: { "@type": "SportsOrganization", name: s.league },
        subjectOf: {
          "@type": "OddsPrediction",
          additionalType: "https://schema.org/Rating",
          name: `${s.market}: ${s.selection}`,
          predictionMarket: s.market,
          predictedSelection: s.selection,
          decimalOdds: s.odds,
          ratingValue: s.confidence,
          bestRating: 100,
          worstRating: 0,
          author: { "@id": `${SITE_URL}/#organization` },
        },
      },
    })),
  };
}
