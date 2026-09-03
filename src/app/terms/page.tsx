import type { Metadata } from "next";
import { LegalLayout, LegalSection, LegalList } from "@/components/LegalLayout";
import { SITE_NAME, SITE_DOMAIN, SUPPORT_EMAIL } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing use of 2Odds Football Prediction — a sports prediction analytics service. Entertainment only, 18+, no refunds on digital access.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "3 September 2026";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of {SITE_NAME} at {SITE_DOMAIN} (the &ldquo;Service&rdquo;). By
          using the Service or purchasing VIP access, you agree to these Terms.
          If you do not agree, do not use the Service.
        </p>
      }
    >
      <LegalSection id="service" heading="1. What the Service is">
        <p>
          {SITE_NAME} is a sports prediction <strong>analytics</strong> service.
          We publish statistical models, form analysis, and opinion-based
          football match selections, including a daily &ldquo;2-odds&rdquo;
          ticket and a paid VIP feed.
        </p>
        <p>
          The Service does not accept bets, hold customer funds for wagering, or
          operate any form of gambling. It is an information and analytics
          product only.
        </p>
      </LegalSection>

      <LegalSection
        id="entertainment"
        heading="2. Entertainment and no-guarantee disclaimer"
      >
        <p>
          All predictions, tips, ratings, and analysis are provided{" "}
          <strong>for informational and entertainment purposes only</strong>.
          They are opinions derived from statistical models and are not:
        </p>
        <LegalList
          items={[
            "financial, investment, or professional advice;",
            "a promise, guarantee, or assurance of any outcome or profit;",
            "a recommendation to place any specific bet or stake any amount.",
          ]}
        />
        <p>
          Sports outcomes are inherently uncertain. Past performance and any
          published strike-rate or record do not predict future results. You are
          solely responsible for any decision you make and any money you stake.
          To the fullest extent permitted by law, {SITE_NAME} accepts no
          liability for losses of any kind arising from use of the Service.
        </p>
      </LegalSection>

      <LegalSection id="age" heading="3. Age restriction (18+)">
        <p>
          You must be at least <strong>18 years old</strong> (or the legal
          gambling age in your jurisdiction, if higher) to use the Service. By
          using it you represent and warrant that you meet this requirement.
        </p>
        <p>
          We may terminate access immediately, without refund, where we
          reasonably believe a user is underage. If you are a parent or guardian
          and believe a minor has used the Service, contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="legality" heading="4. Your local laws">
        <p>
          Betting and the use of prediction services are regulated differently
          around the world and are restricted or illegal in some places. It is
          your responsibility to ensure that using the Service and acting on its
          content is lawful where you are. We make no representation that the
          Service is appropriate or available in any particular location.
        </p>
      </LegalSection>

      <LegalSection id="vip" heading="5. VIP access and payment">
        <p>
          VIP access is a digital subscription granting access to additional
          picks and analysis for a fixed period (weekly or monthly). Prices are
          shown at checkout in your selected currency.
        </p>
        <LegalList
          items={[
            "Payments are processed by Flutterwave, our third-party payment processor. We do not store your full card details.",
            "Access is granted for the period you paid for and does not auto-renew unless stated at checkout.",
            "We may change VIP pricing or features for future purchases; changes do not affect a period you have already paid for.",
          ]}
        />
      </LegalSection>

      <LegalSection id="refunds" heading="6. No-refund policy for digital access">
        <p>
          VIP access is a digital product delivered immediately. Because content
          for the paid period is released as soon as your payment is verified,{" "}
          <strong>
            all sales are final and no refunds, credits, or exchanges are
            provided
          </strong>{" "}
          once access has been granted — including where selections lose, where
          you did not use the access, or where you change your mind.
        </p>
        <p>
          The only exceptions are those we are required to grant by applicable
          law, or a duplicate/incorrect charge caused by a verified processing
          error, which you must report to {SUPPORT_EMAIL} within 7 days.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" heading="7. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "resell, redistribute, scrape, or republish VIP picks or any Service content;",
            "share VIP account access or session cookies with others;",
            "attempt to disrupt, reverse-engineer, or gain unauthorised access to the Service;",
            "use the Service for any unlawful purpose.",
          ]}
        />
        <p>
          We may suspend or terminate access, without refund, for breach of this
          section.
        </p>
      </LegalSection>

      <LegalSection id="ip" heading="8. Intellectual property">
        <p>
          All content on the Service — models, analysis, text, and branding — is
          owned by {SITE_NAME} or its licensors and is protected by intellectual
          property laws. You receive a personal, non-transferable, revocable
          licence to view it for your own use only.
        </p>
      </LegalSection>

      <LegalSection id="responsible" heading="9. Responsible gambling">
        <p>
          Betting can be addictive. Only stake money you can afford to lose, set
          limits, and take breaks. Free, confidential help is available from{" "}
          <a
            href="https://www.begambleaware.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            BeGambleAware
          </a>{" "}
          and{" "}
          <a
            href="https://www.gamblingtherapy.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Gambling Therapy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="10. Changes, termination, and contact">
        <p>
          We may update these Terms from time to time; the &ldquo;last
          updated&rdquo; date above reflects the current version, and continued
          use after a change means you accept it. We may modify or discontinue
          the Service at any time. These Terms are governed by the laws of the
          Federal Republic of Nigeria, without regard to conflict-of-law rules.
        </p>
        <p>
          Contact:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
