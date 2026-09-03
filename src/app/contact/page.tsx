import type { Metadata } from "next";
import { Mail, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { SUPPORT_EMAIL } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the 2Odds Football Prediction support desk by email or the inquiry form. We reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto grid w-full max-w-4xl gap-12 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <MessageCircle className="size-3.5" aria-hidden />
              Contact
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Talk to support
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Questions about VIP access, a payment, or a pick result? Send a
              message and we&rsquo;ll get back to you.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-emerald-500" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Support email
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm font-medium text-zinc-900 hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-400"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 text-emerald-500" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Response time
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Within 24 hours, usually much sooner on matchdays.
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Social
              </p>
              <SocialLinks withHandles className="flex-col !items-start" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Send an inquiry
          </h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
