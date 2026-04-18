"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  computeTotal,
  normalizePrayerNotYetTime,
  prayerApplicableMaxPoints,
  prayerSum,
} from "@/lib/muhasabahScoring";
import { dateKeyInTimeZone } from "@/lib/dateKey";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import {
  isLocalSessionCompleteForDate,
  loadAllDrafts,
  resetLocalSessionForDate,
  saveDraftForDateKey,
  setLocalSessionCompleteForDate,
  type LocalDraftShape,
} from "@/lib/muhasabahLocalDraft";
import type { UserSettings } from "@/lib/muhasabahTypes";
import { setTransientMuhasabahSession } from "@/lib/transientMuhasabahSession";
import {
  useMuhasabahDay,
  useMuhasabahMutations,
  useUserSettings,
} from "@/lib/useMuhasabahFirebase";
import { defaultEntry, OUTRO_SLIDE } from "./muhasabah-journal/constants";
import type { EntryState, PrayerScores } from "./muhasabah-journal/types";
import { DhikrSlide } from "./muhasabah-journal/slides/DhikrSlide";
import { HeartSlide } from "./muhasabah-journal/slides/HeartSlide";
import { IbadatSlide } from "./muhasabah-journal/slides/IbadatSlide";
import { KindnessSlide } from "./muhasabah-journal/slides/KindnessSlide";
import { LearningSlide } from "./muhasabah-journal/slides/LearningSlide";
import { OutroSlide } from "./muhasabah-journal/slides/OutroSlide";
import { PrayersSlide } from "./muhasabah-journal/slides/PrayersSlide";
import { TongueSlide } from "./muhasabah-journal/slides/TongueSlide";

export type MuhasabahJournalProps =
  | { variant: "anonymous" }
  | { variant: "signedIn"; settings: UserSettings | null };

function JournalLoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-white px-5 text-center dark:bg-gray-950 md:mx-auto md:min-h-screen md:max-w-lg md:shadow-2xl">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-accent border-t-transparent shadow-sm" />
      <p className="mt-4 font-display font-medium text-brand-ink dark:text-brand-mint">
        Loading…
      </p>
    </div>
  );
}

export function MuhasabahJournal(props: MuhasabahJournalProps) {
  const { authToken, isAuthenticated, signInWithGoogle } = useFirebaseAuth();
  const canUseCloudAuth = props.variant === "signedIn" || isAuthenticated;
  /** Keep the UI signed-in while Firebase finishes confirming a locally stored auth token. */
  const isSignedIn = canUseCloudAuth || authToken !== null;

  const settingsFromQuery = useUserSettings(isAuthenticated && props.variant === "anonymous");

  const settings =
    props.variant === "signedIn" ? props.settings : settingsFromQuery ?? null;

  const router = useRouter();
  const { markSessionComplete, upsertDay, upsertUserSettings } = useMuhasabahMutations();
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const effectiveTimeZone = settings?.ianaTimezone ?? browserTimeZone;

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = dateKeyInTimeZone(selectedDate, effectiveTimeZone);

  const entry = useMuhasabahDay(dateKey, canUseCloudAuth);

  const [form, setForm] = useState<EntryState>(defaultEntry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [slideIndex, setSlideIndex] = useState(() =>
    !isSignedIn && isLocalSessionCompleteForDate(dateKey) ? OUTRO_SLIDE : 0,
  );
  const prevDateKeyRef = useRef(dateKey);

  useEffect(() => {
    if (!canUseCloudAuth || entry === undefined) return;
    if (entry) {
      setForm({
        prayers: entry.prayers,
        prayerNotYetTime: normalizePrayerNotYetTime(entry.prayerNotYetTime),
        dhikrQuran: entry.dhikrQuran,
        ibadat: entry.ibadat,
        kindness: entry.kindness,
        learning: entry.learning,
        tongueDistractions: entry.tongueDistractions,
        heart: entry.heart,
        notes: entry.notes ?? {},
      });
    } else {
      setForm(defaultEntry);
    }
    setSaved(false);
  }, [canUseCloudAuth, entry, dateKey]);

  useEffect(() => {
    if (isSignedIn) return;
    const drafts = loadAllDrafts();
    const draft = drafts[dateKey];
    if (draft) {
      setForm({
        ...(draft as EntryState),
        prayerNotYetTime: normalizePrayerNotYetTime(
          (draft as LocalDraftShape).prayerNotYetTime,
        ),
      });
    } else {
      setForm(defaultEntry);
    }
    setSaved(false);
  }, [isSignedIn, dateKey]);

  useEffect(() => {
    if (prevDateKeyRef.current === dateKey) return;
    prevDateKeyRef.current = dateKey;
    setSlideIndex(!isSignedIn && isLocalSessionCompleteForDate(dateKey) ? OUTRO_SLIDE : 0);
  }, [dateKey, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) return;
    const t = window.setTimeout(() => {
      saveDraftForDateKey(dateKey, form as LocalDraftShape);
    }, 350);
    return () => window.clearTimeout(t);
  }, [isSignedIn, dateKey, form]);

  useEffect(() => {
    if (!canUseCloudAuth) return;
    const tz = browserTimeZone;
    if (!settings) {
      void upsertUserSettings({ ianaTimezone: tz });
      return;
    }
    if (settings.ianaTimezone !== tz) {
      void upsertUserSettings({ ianaTimezone: tz });
    }
  }, [canUseCloudAuth, settings, upsertUserSettings, browserTimeZone]);

  const prayerNotYetNorm = normalizePrayerNotYetTime(form.prayerNotYetTime);

  const total = computeTotal(
    form.prayers,
    form.dhikrQuran,
    form.ibadat,
    form.kindness,
    form.learning,
    form.tongueDistractions,
    form.heart,
    prayerNotYetNorm,
  );

  const prayerTotal = prayerSum(form.prayers, prayerNotYetNorm);
  const prayerMax = prayerApplicableMaxPoints(prayerNotYetNorm);

  const handleSave = useCallback(async () => {
    if (!canUseCloudAuth) return;
    setSaving(true);
    try {
      await upsertDay({
        dateKey,
        prayers: form.prayers as {
          fajr: 0 | 1 | 2;
          dhuhr: 0 | 1 | 2;
          asr: 0 | 1 | 2;
          maghrib: 0 | 1 | 2;
          isha: 0 | 1 | 2;
        },
        prayerNotYetTime: prayerNotYetNorm,
        dhikrQuran: form.dhikrQuran,
        ibadat: form.ibadat,
        kindness: form.kindness,
        learning: form.learning,
        tongueDistractions: form.tongueDistractions,
        heart: form.heart,
        notes: form.notes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }, [canUseCloudAuth, dateKey, form, upsertDay, prayerNotYetNorm]);

  const saveAndCompleteSignedIn = useCallback(async () => {
    if (!canUseCloudAuth) return;
    setSaving(true);
    try {
      await upsertDay({
        dateKey,
        prayers: form.prayers as {
          fajr: 0 | 1 | 2;
          dhuhr: 0 | 1 | 2;
          asr: 0 | 1 | 2;
          maghrib: 0 | 1 | 2;
          isha: 0 | 1 | 2;
        },
        prayerNotYetTime: prayerNotYetNorm,
        dhikrQuran: form.dhikrQuran,
        ibadat: form.ibadat,
        kindness: form.kindness,
        learning: form.learning,
        tongueDistractions: form.tongueDistractions,
        heart: form.heart,
        notes: form.notes,
      });
      await markSessionComplete({ dateKey });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to finish session:", error);
    } finally {
      setSaving(false);
    }
  }, [canUseCloudAuth, dateKey, form, upsertDay, markSessionComplete, router, prayerNotYetNorm]);

  const signInAfterAnonymousCompletion = useCallback(() => {
    saveDraftForDateKey(dateKey, form as LocalDraftShape);
    setLocalSessionCompleteForDate(dateKey);
    void signInWithGoogle("/dashboard");
  }, [dateKey, form, signInWithGoogle]);

  const startLocalSessionOver = useCallback(() => {
    resetLocalSessionForDate(dateKey);
    setForm(defaultEntry);
    setSaved(false);
    setSlideIndex(0);
  }, [dateKey]);

  const finishAnonymousToDashboard = useCallback(() => {
    setTransientMuhasabahSession({ dateKey, draft: form as LocalDraftShape });
    resetLocalSessionForDate(dateKey);
    router.push("/dashboard");
  }, [dateKey, form, router]);

  const updatePrayer = (name: keyof PrayerScores, value: number) => {
    setForm((prev) => ({
      ...prev,
      prayerNotYetTime: { ...prev.prayerNotYetTime, [name]: false },
      prayers: { ...prev.prayers, [name]: value },
    }));
  };

  const togglePrayerNotYet = (name: keyof PrayerScores) => {
    setForm((prev) => {
      const next = !prev.prayerNotYetTime[name];
      return {
        ...prev,
        prayerNotYetTime: { ...prev.prayerNotYetTime, [name]: next },
        prayers: next ? { ...prev.prayers, [name]: 0 } : prev.prayers,
      };
    });
  };

  const goNext = () => {
    if (!isSignedIn && slideIndex >= OUTRO_SLIDE - 1) {
      finishAnonymousToDashboard();
      return;
    }
    setSlideIndex((i) => (i >= OUTRO_SLIDE ? i : i + 1));
  };

  const goPrev = () => {
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  if (canUseCloudAuth && entry === undefined) {
    return <JournalLoadingScreen />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white dark:bg-gray-950 md:mx-auto md:min-h-screen md:max-w-lg md:shadow-2xl">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top,0px))]"
        >
          {slideIndex === 0 && (
            <PrayersSlide
              prayers={form.prayers}
              prayerNotYetTime={form.prayerNotYetTime}
              updatePrayer={updatePrayer}
              togglePrayerNotYet={togglePrayerNotYet}
            />
          )}

          {slideIndex === 1 && <DhikrSlide form={form} setForm={setForm} />}

          {slideIndex === 2 && <IbadatSlide form={form} setForm={setForm} />}

          {slideIndex === 3 && <KindnessSlide form={form} setForm={setForm} />}

          {slideIndex === 4 && <LearningSlide form={form} setForm={setForm} />}

          {slideIndex === 5 && <TongueSlide form={form} setForm={setForm} />}

          {slideIndex === 6 && <HeartSlide form={form} setForm={setForm} />}

          {slideIndex === OUTRO_SLIDE && (
            <OutroSlide
              total={total}
              prayerTotal={prayerTotal}
              prayerMax={prayerMax}
              isSignedIn={isSignedIn}
              isAuthReady={canUseCloudAuth}
              saving={saving}
              saved={saved}
              onSignInAfterAnonymousCompletion={signInAfterAnonymousCompletion}
              onSaveAndCompleteSignedIn={saveAndCompleteSignedIn}
              onSaveOnly={handleSave}
              onStartOver={startLocalSessionOver}
            />
          )}
        </main>
      </div>

      {slideIndex < OUTRO_SLIDE && (
        <nav
          className="shrink-0 border-t-2 border-brand-periwinkle/10 bg-brand-white/80 backdrop-blur-md px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 dark:bg-gray-900/80"
          aria-label={
            slideIndex >= 1 ? "Move between journal steps" : "Continue to next step"
          }
        >
          <div
            className={
              slideIndex >= 1 ? "flex min-h-[56px] gap-4" : "flex min-h-[56px]"
            }
          >
            {slideIndex >= 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="min-h-[56px] min-w-[6.5rem] shrink-0 rounded-2xl border-2 border-brand-periwinkle/30 bg-brand-white text-base font-display font-bold text-brand-ink shadow-sm active:scale-95 transition-all dark:bg-gray-800 dark:text-brand-white"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className={`min-h-[56px] rounded-2xl bg-brand-accent text-base font-display font-bold text-white shadow-lg shadow-brand-accent/25 active:scale-95 transition-all hover:scale-[1.02] ${
                slideIndex >= 1 ? "min-w-0 flex-1" : "w-full"
              }`}
            >
              Continue
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
