import Link from "next/link";

type Props = {
  total: number;
  prayerTotal: number;
  prayerMax: number;
  isSignedIn: boolean;
  saving: boolean;
  saved: boolean;
  onSignInAfterAnonymousCompletion: () => void;
  onFinishAnonymousLocal: () => void;
  onSaveAndCompleteSignedIn: () => void | Promise<void>;
  onSaveOnly: () => void | Promise<void>;
};

export function OutroSlide({
  total,
  prayerTotal,
  prayerMax,
  isSignedIn,
  saving,
  saved,
  onSignInAfterAnonymousCompletion,
  onFinishAnonymousLocal,
  onSaveAndCompleteSignedIn,
  onSaveOnly,
}: Props) {
  return (
    <div className="flex min-h-[50dvh] flex-col justify-center gap-6 pb-8 pt-4">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-6 text-center dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-gray-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          Session complete
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white">
          You&apos;ve finished today&apos;s muhasabah session.
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Today&apos;s total:{" "}
          <span className="font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{total}</span>
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
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Save your progress
            </p>
            <h3
              id="anonymous-save-heading"
              className="mt-1 text-lg font-bold leading-snug text-gray-900 dark:text-white"
            >
              Sign in to sync across devices
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Until you sign in, today&apos;s entry stays only on this browser. Google keeps your streak and scores
              available wherever you use the app.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onSignInAfterAnonymousCompletion}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:bg-indigo-700 dark:shadow-indigo-900/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white" aria-hidden>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
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
                </span>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={onFinishAnonymousLocal}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-100 dark:hover:bg-gray-900 dark:active:bg-gray-900/80"
              >
                Save on this device only
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
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => void onSaveAndCompleteSignedIn()}
            disabled={saving}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white active:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & go to dashboard"}
          </button>
          <button
            type="button"
            onClick={() => void onSaveOnly()}
            disabled={saving}
            className="w-full rounded-2xl border border-gray-300 py-3 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:active:bg-gray-700"
          >
            {saved ? "Saved" : "Save only (stay here)"}
          </button>
        </div>
      )}
    </div>
  );
}
