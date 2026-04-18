"use client";

import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-brand-white dark:bg-gray-950 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-mint/40 blur-[120px] dark:bg-brand-accent/5" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-brand-alice/60 blur-[120px] dark:bg-brand-accent/10" />
      </div>

      <main
        id="main-content"
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-brand-mint/80 px-4 py-1.5 dark:bg-brand-accent/10">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-accent" />
          <p className="font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent dark:text-brand-periwinkle">
            Daily self-reflection
          </p>
        </div>

        <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-7xl dark:text-brand-white">
          Muhasabah
        </h1>

        <p className="font-body mt-8 max-w-lg text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-brand-alice/80">
          A minimalist companion for Islamic self-accountability. Track your prayers, conduct, and spiritual growth with clarity.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/today"
            className="font-display group relative inline-flex min-h-[60px] min-w-[240px] items-center justify-center overflow-hidden rounded-2xl bg-brand-accent px-8 py-4 text-lg font-bold text-brand-white shadow-xl shadow-brand-accent/30 transition-all hover:scale-[1.02] hover:shadow-brand-accent/40 active:scale-[0.98]"
          >
            <span className="relative z-10">Start your reflection</span>
            <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform group-hover:translate-y-0" />
          </Link>
          
          <Link
            href="/dashboard"
            className="font-display inline-flex min-h-[60px] min-w-[240px] items-center justify-center rounded-2xl border-2 border-brand-periwinkle/30 bg-brand-white px-8 py-4 text-lg font-bold text-brand-ink shadow-sm transition-all hover:border-brand-periwinkle/60 hover:shadow-md active:scale-[0.98] dark:bg-gray-900 dark:text-brand-white"
          >
            View dashboard
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-8 opacity-40 dark:opacity-20 grayscale">
          <div className="h-px w-12 bg-brand-ink dark:bg-brand-white" />
          <p className="font-mono-brand text-[10px] uppercase tracking-widest text-brand-ink dark:text-brand-white">Est. 2024</p>
          <div className="h-px w-12 bg-brand-ink dark:bg-brand-white" />
        </div>
      </main>
    </div>
  );
}
