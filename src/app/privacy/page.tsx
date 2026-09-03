import type { Metadata } from "next";
import { LegalLayout, LegalSection, LegalList } from "@/components/LegalLayout";
import { SITE_NAME, SITE_DOMAIN, SUPPORT_EMAIL } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How 2Odds Football Prediction handles your data: email collection, Flutterwave payment processing, and the HTTP cookie used for VIP session state.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "3 September 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <p>
          This policy explains what personal data {SITE_NAME} ({SITE_DOMAIN})
          collects, why, who we share it with, and the choices you have. We keep
          data collection deliberately minimal — we do not run advertising
          trackers or sell personal data.
        </p>
      }
    >
      <LegalSection id="what-we-collect" heading="1. What we collect">
        <LegalList
          items={[
            <>
              <strong>Email address</strong> — when you enter it to buy VIP
              access, restore access on another device, or use the contact form.
            </>,
            <>
              <strong>Contact-form content</strong> — the name, optional
              subject, and message you submit.
            </>,
            <>
              <strong>Payment metadata</strong> — the transaction reference,
              amount, currency, plan, and status returned by our payment
              processor after a purchase. We never receive or store your full
              card number, CVV, or bank credentials.
            </>,
            <>
              <strong>Technical data</strong> — standard server logs (IP
              address, user agent, timestamps) generated when you load pages,
              kept short-term for security and troubleshooting.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="email" heading="2. How we use your email">
        <p>We use your email address only to:</p>
        <LegalList
          items={[
            "identify your VIP purchase and activate or restore your access;",
            "send you the transactional messages tied to that purchase (access confirmation, receipts, support replies);",
            "respond to enquiries you send us.",
          ]}
        />
        <p>
          We do not add you to marketing lists without your consent. If we ever
          offer an optional newsletter, it will have its own opt-in and an
          unsubscribe link in every message.
        </p>
      </LegalSection>

      <LegalSection
        id="flutterwave"
        heading="3. Payments — Flutterwave (third-party processor)"
      >
        <p>
          VIP payments are processed by <strong>Flutterwave</strong>, an
          independent third-party payment provider. When you check out:
        </p>
        <LegalList
          items={[
            "your card or bank details are entered into Flutterwave's own secure checkout and are handled by Flutterwave, not by us;",
            "Flutterwave acts as an independent data controller for the payment data it collects, under its own privacy policy;",
            "after payment, our server asks Flutterwave to verify the transaction and receives back only the reference, amount, currency, status, and the email/name you gave at checkout;",
            "we use that response to grant VIP access and to reconcile payments.",
          ]}
        />
        <p>
          Review{" "}
          <a
            href="https://flutterwave.com/us/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Flutterwave&rsquo;s privacy policy
          </a>{" "}
          to understand how it handles your payment information.
        </p>
      </LegalSection>

      <LegalSection id="cookies" heading="4. Cookies and local storage">
        <p>
          We use a small number of first-party cookies. We do <strong>not</strong>{" "}
          use advertising or cross-site tracking cookies.
        </p>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                <th className="px-3 py-2 font-semibold">Cookie</th>
                <th className="px-3 py-2 font-semibold">Purpose</th>
                <th className="px-3 py-2 font-semibold">Type / life</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600 dark:text-zinc-400">
              <tr className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-3 py-2 font-mono">vip_access</td>
                <td className="px-3 py-2">
                  Stores your <strong>VIP session state</strong> after a verified
                  payment so premium picks are unlocked on your device. It is a
                  signed token containing your plan, the transaction reference,
                  the email used at checkout, and an expiry — no password.
                </td>
                <td className="px-3 py-2">
                  Strictly necessary. HTTP cookie, <code>HttpOnly</code>,{" "}
                  <code>SameSite=Lax</code>, <code>Secure</code> in production.
                  Expires with your membership (about one month max).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">
                  browser storage (optional)
                </td>
                <td className="px-3 py-2">
                  Minor interface conveniences such as a remembered currency or
                  plan choice. Never leaves your browser.
                </td>
                <td className="px-3 py-2">Preference. Local to your device.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The <code>vip_access</code> cookie is essential to deliver a product
          you have paid for, so it is set without a consent banner. You can
          delete it any time via your browser settings; doing so simply
          re-locks the VIP feed on that device until you restore access.
        </p>
      </LegalSection>

      <LegalSection id="sharing" heading="5. Who we share data with">
        <p>
          We share personal data only with service providers that help us run
          the Service, and only as needed:
        </p>
        <LegalList
          items={[
            "Flutterwave — payment processing and verification;",
            "our hosting and infrastructure providers — to serve the site and store logs;",
            "email/support tooling — to deliver transactional and support messages.",
          ]}
        />
        <p>
          We may also disclose data where required by law or to protect our
          rights, users, or the Service. We do not sell personal data.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="6. Retention">
        <LegalList
          items={[
            "Purchase records (email + payment metadata): kept while your membership is active and for up to 6 years afterwards for accounting and dispute purposes.",
            "Contact-form messages: kept up to 24 months, then deleted.",
            "Server logs: typically 30–90 days.",
          ]}
        />
      </LegalSection>

      <LegalSection id="rights" heading="7. Your rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, delete, or export your personal data, and to object to or
          restrict certain processing. To make a request, email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          from the address you used with us. We will respond within a reasonable
          period and may need to verify your identity first.
        </p>
      </LegalSection>

      <LegalSection id="security-children" heading="8. Security and children">
        <p>
          We use signed cookies, HTTPS, and server-side payment verification to
          protect data, but no method of transmission or storage is completely
          secure. The Service is strictly for adults aged 18 or over and is not
          directed at children; we do not knowingly collect data from anyone
          under 18.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="9. Changes and contact">
        <p>
          We may update this policy; the &ldquo;last updated&rdquo; date above
          shows the current version. For any privacy question or request,
          contact{" "}
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
