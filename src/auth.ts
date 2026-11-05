import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { SITE_NAME } from "@/data/site";

/**
 * NextAuth (Auth.js v5) — email magic-link sign-in only, no passwords.
 *
 * Session storage: `@auth/supabase-adapter`, which manages its own tables in
 * the `next_auth` Postgres schema (see supabase/schema.sql). That schema is
 * entirely separate from `public.subscriptions`, which is *our* VIP
 * membership record — this file only establishes "who is this visitor",
 * never "are they VIP". VIP status is looked up separately in
 * `src/lib/vip-status.ts`.
 */
// `@supabase/supabase-js` validates its URL synchronously at construction —
// an empty string throws immediately at module-import time, which would
// crash the whole Next.js build/route-collection phase before a single
// request is ever handled. Fall back to a syntactically-valid placeholder so
// the app still builds and boots when Supabase isn't configured yet; actual
// auth calls simply fail at request time with a clear "not configured" error
// instead of taking the build down with them.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: SUPABASE_URL,
    secret: SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? `${SITE_NAME} <no-reply@2oddsfootballprediction.com>`,
      // Outside production, skip the real Resend call entirely and print the
      // sign-in link to the server console instead — lets magic-link login
      // be tested locally without a configured Resend API key. Production
      // always uses the provider's normal send-via-Resend behavior.
      ...(process.env.NODE_ENV !== "production" && {
        async sendVerificationRequest({ identifier, url }: { identifier: string; url: string }) {
          console.log(`\n[dev] Magic sign-in link for ${identifier}:\n${url}\n`);
        },
      }),
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  trustHost: true,
});
