import Link from "next/link";

type Props = {
  total: number;
  prayerTotal: number;
  prayerMax: number;
  isSignedIn: boolean;
  isAuthReady: boolean;
  saving: boolean;
  saved: boolean;
  onSignInAfterAnonymousCompletion: () => void;
  onSaveAndCompleteSignedIn: () => void | Promise<void>;
  onSaveOnly: () => void | Promise<void>;
  onStartOver: () => void;
};

export function OutroSlide({
  total,
  prayerTotal,
  prayerMax,
  isSignedIn,
  isAuthReady,
  saving,
  saved,
  onSignInAfterAnonymousCompletion,
  onSaveAndCompleteSignedIn,
  onSaveOnly,
  onStartOver,
}: Props) {
  let signedInPrimaryLabel = "Go to dashboard";
  if (!isAuthReady) {
    signedInPrimaryLabel = "Connecting…";
  } else if (saving) {
    signedInPrimaryLabel = "Saving…";
  }

  return (
    <div className="flex min-h-[50dvh] flex-col justify-center gap-6 pb-8 pt-4">
      <div className="rounded-[2rem] border-2 border-brand-mint bg-brand-mint/30 p-6 text-center shadow-sm dark:border-brand-accent/20 dark:bg-brand-accent/5">
        <p className="font-mono-brand text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-brand-periwinkle">
          Session complete
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold leading-tight text-brand-ink dark:text-brand-white">
          You&apos;ve finished today&apos;s reflection.
        </h2>
        <p className="font-body mt-3 text-sm text-gray-600 dark:text-gray-300">
          Today&apos;s total:{" "}
          <span className="font-mono-brand font-bold tabular-nums text-brand-accent">{total}</span>
          <span className="text-gray-400"> · </span>
          Prayers {prayerTotal}/{prayerMax}
        </p>
      </div>

      {!isSignedIn ? (
        <div
          className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_40px_-12px_rgba(79,70,229,0.12)] dark:border-gray-600/80 dark:bg-gray-800/95 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
          role="region"
          aria-labelledby="anonymous-save-heading"
        >
          <div
            className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-500 to-violet-400 dark:from-violet-600 dark:via-indigo-500 dark:to-violet-600"
            aria-hidden
          />
          <div className="p-6 sm:p-7">
            <p className="font-mono-brand text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-brand-periwinkle">
              Save your progress
            </p>
            <h3
              id="anonymous-save-heading"
              className="font-display mt-2 text-xl font-bold leading-snug text-brand-ink dark:text-brand-white"
            >
              Sign in to sync across devices
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Today&apos;s entry is saved in this browser first. Google sign-in moves it to your account and opens your
              dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onSignInAfterAnonymousCompletion}
                className="inline-flex w-full min-h-11 items-center justify-center gap-3 rounded border border-[#dadce0] bg-white px-4 py-3 text-base font-medium text-[#1f1f1f] shadow-[0_1px_2px_rgba(60,64,67,0.15)] transition hover:shadow-[0_1px_4px_rgba(60,64,67,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4] active:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-[#131314] dark:text-[#e8eaed] dark:shadow-none dark:hover:bg-[#1e1f20] dark:active:bg-[#2d2f31]"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={onStartOver}
                className="w-full rounded-2xl border-2 border-brand-periwinkle/30 bg-brand-white py-3 font-display text-sm font-bold text-brand-ink transition-all hover:border-brand-periwinkle/60 active:scale-[0.98] dark:bg-gray-900 dark:text-brand-white"
              >
                Start over
              </button>
            </div>

            <p className="mt-5 border-t border-gray-100 pt-5 text-center text-[11px] leading-relaxed text-gray-500 dark:border-gray-700 dark:text-gray-500">
              By continuing with Google you agree to our{" "}
              <Link href="/terms" className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400">
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_40px_-12px_rgba(79,70,229,0.12)] dark:border-gray-600/80 dark:bg-gray-800/95 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
          role="region"
          aria-labelledby="signed-in-outro-heading"
        >
          <div
            className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-500 to-violet-400 dark:from-violet-600 dark:via-indigo-500 dark:to-violet-600"
            aria-hidden
          />
          <div className="p-6 sm:p-7">
            <p className="font-mono-brand text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-brand-periwinkle">
              All set
            </p>
            <h3
              id="signed-in-outro-heading"
              className="font-display mt-2 text-xl font-bold leading-snug text-brand-ink dark:text-brand-white"
            >
              Save and open your dashboard
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Your entry will be synced to your account. You can review streaks and scores on the dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void onSaveAndCompleteSignedIn()}
                disabled={saving || !isAuthReady}
                className="w-full rounded-2xl bg-brand-accent py-3.5 font-display text-base font-bold text-white shadow-lg shadow-brand-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {signedInPrimaryLabel}
              </button>
              <button
                type="button"
                onClick={() => void onSaveOnly()}
                disabled={saving || !isAuthReady}
                className="w-full rounded-2xl border-2 border-brand-periwinkle/30 bg-brand-white py-3 font-display text-sm font-bold text-brand-ink transition-all hover:border-brand-periwinkle/60 active:scale-[0.98] disabled:opacity-50 dark:bg-gray-900 dark:text-brand-white"
              >
                {saved ? "Saved" : "Save only (stay here)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
