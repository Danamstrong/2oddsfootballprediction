import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center font-sans dark:bg-black">
      <Compass className="size-8 text-emerald-500" aria-hidden />
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        Back to today&rsquo;s picks
      </Link>
    </main>
  );
}
