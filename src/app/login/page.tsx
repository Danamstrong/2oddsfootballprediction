import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to 2Odds Football Prediction to view your VIP picks.",
  robots: { index: false, follow: false },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/vip";
  const prefillEmail = params.email ?? "";

  // Already signed in — nothing to do here.
  const session = await auth();
  if (session?.user?.email) {
    redirect(callbackUrl);
  }

  async function sendMagicLink(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const dest = String(formData.get("callbackUrl") ?? "/vip");
    if (!EMAIL_RE.test(email)) {
      redirect(`/login?error=invalid-email&callbackUrl=${encodeURIComponent(dest)}`);
    }
    await signIn("resend", { email, redirectTo: dest });
  }

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Mail className="size-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Sign in to VIP
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter the email you paid with. We&rsquo;ll send you a one-time
            sign-in link &mdash; no password needed.
          </p>
        </div>

        {params.error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          >
            Enter a valid email address.
          </p>
        )}

        <form action={sendMagicLink} className="flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label htmlFor="login-email" className="sr-only">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue={prefillEmail}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Send sign-in link
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Haven&rsquo;t paid yet?{" "}
          <Link href="/#vip-heading" className="font-medium text-emerald-600 dark:text-emerald-400">
            Join VIP
          </Link>
        </p>
      </div>
    </main>
  );
}
