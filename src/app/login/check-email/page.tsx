import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-4 py-20 text-center sm:px-6">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <MailCheck className="size-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Check your email
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent you a sign-in link. Open it on this device to unlock your
          VIP picks &mdash; it expires in 24 hours.
        </p>
      </div>
    </main>
  );
}
