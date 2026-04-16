"use client";

import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-brand-mint via-brand-white to-brand-alice px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] dark:from-[#1a1423] dark:via-[#221a32] dark:to-[#1a1423]">
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <p className="font-mono-brand text-[0.7rem] font-normal uppercase tracking-[0.35em] text-brand-accent dark:text-brand-periwinkle">
          Daily self-accountability
        </p>

        <h1 className="font-display mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-brand-ink sm:text-6xl sm:leading-[1.02] dark:text-brand-mint">
          Muhasabah
        </h1>

        <p className="font-body mt-6 max-w-lg text-lg leading-relaxed text-brand-ink/80 dark:text-brand-alice/90">
          Keep yourself accountable one day at a time.
        </p>

        <Link
          href="/today"
          className="font-display mt-10 inline-flex min-h-[52px] min-w-[min(100%,20rem)] items-center justify-center rounded-2xl bg-brand-accent px-8 py-4 text-base font-semibold text-white shadow-[0_12px_40px_-8px_rgba(138,79,255,0.55)] transition hover:bg-[#7b41e8] hover:shadow-[0_16px_44px_-8px_rgba(138,79,255,0.6)] active:scale-[0.99] dark:shadow-[0_12px_40px_-8px_rgba(138,79,255,0.35)]"
        >
          Start today&rsquo;s muhasabah
        </Link>
      </main>
    </div>
  );
}
