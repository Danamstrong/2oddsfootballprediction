import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, LogOut, ShieldCheck } from "lucide-react";
import { auth, signOut } from "@/auth";
import { getVipStatusByEmail } from "@/lib/vip-status";
import { getCurrentEdition, formatEditionDate } from "@/lib/predictions";
import { PredictionCard } from "@/components/PredictionCard";

// Never let this leak into search results — it's paid content.
export const metadata: Metadata = {
  title: "VIP Picks",
  robots: { index: false, follow: false },
};

export default async function VipPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  // Not signed in at all — nothing to check, go straight to login.
  if (!email) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/vip")}`);
  }

  // Signed in, but re-check VIP status fresh from the database on every
  // request — a session proves identity, never entitlement.
  const { isVip, expiresAt } = await getVipStatusByEmail(email);

  if (!isVip) {
    return (
      <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
          <Crown className="size-8 text-amber-500" aria-hidden />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            No active VIP subscription
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You&rsquo;re signed in as <strong>{email}</strong>, but we don&rsquo;t
            see an active VIP membership on this email. If you just paid, this
            can take a minute to activate &mdash; refresh shortly. Otherwise,
            join VIP to unlock today&rsquo;s picks.
          </p>
          <Link
            href="/#vip-heading"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Join VIP
          </Link>
        </div>
      </main>
    );
  }

  const edition = getCurrentEdition();

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" aria-hidden />
              VIP active{expiresAt ? ` · expires ${formatEditionDate(expiresAt.slice(0, 10))}` : ""}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Today&rsquo;s VIP picks
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatEditionDate(edition.date)} &middot; signed in as {email}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <LogOut className="size-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </header>

        {edition.vip.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No VIP picks published yet for today &mdash; check back soon.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {edition.vip.map((pick) => (
              <PredictionCard key={pick.id} pick={pick} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
