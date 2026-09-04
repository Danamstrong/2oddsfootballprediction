import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MonetagScripts } from "@/components/MonetagScripts";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL, SITE_TAGLINE } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Daily data-driven football predictions and 2 odds betting tips. Match analysis, form trends, and statistical insights to guide your bets.";
const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "2 odds football prediction",
    "football prediction",
    "daily football tips",
    "betting tips",
    "football betting predictions",
    "sure 2 odds",
    "match analysis",
    "football stats",
    "verified sports analytics",
    "VIP football picks",
  ],
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "PliQy29lHYIOrtCYkN8vG_QX-tYafWwvHL17bRjWEV8",
  },
  other: {
    // Monetag site ownership verification.
    monetag: "4657df9632b9d7560a216a7f8403d960",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd()} id="schema-organization" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E37937VTP2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E37937VTP2');
          `}
        </Script>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          async
        />
        <Script
          id="onesignal-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "b7bccc1f-622b-48cf-8d0e-6eead48e4e52",
                  safari_web_id: "web.onesignal.auto.271ef36b-44de-4fef-87dc-9a2f81b1418e",
                  notifyButton: {
                    enable: false, // Hides the bottom-right bell widget
                  },
                  promptOptions: {
                    slidedown: {
                      prompts: [
                        {
                          type: "push",
                          autoPrompt: true,
                          text: {
                            actionMessage: "Subscribe to receive daily 2+ odds predictions instantly before matches go live!",
                            acceptButton: "Subscribe Now",
                            cancelButton: "Maybe Later",
                          },
                          delay: {
                            pageViews: 1,
                            timeDelay: 3, // Opens 3 seconds after page load
                          },
                        },
                      ],
                    },
                  },
                  allowLocalhostAsSecureOrigin: true,
                });
              });
            `,
          }}
        />
        <MonetagScripts />
        <Script
          id="monetag-inpage-push"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11716996',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
      </body>
    </html>
  );
}
