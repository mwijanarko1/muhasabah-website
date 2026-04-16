"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import {
  computeTotal,
  normalizePrayerNotYetTime,
  prayerApplicableMaxPoints,
  prayerSum,
} from "../../convex/helpers";
import { dateKeyInTimeZone } from "@/lib/dateKey";
import {
  loadAllDrafts,
  saveDraftForDateKey,
  setLocalSessionCompleteForDate,
  type LocalDraftShape,
} from "@/lib/muhasabahLocalDraft";
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
  | { variant: "signedIn"; settings: Doc<"userSettings"> | null };

export function MuhasabahJournal(props: MuhasabahJournalProps) {
  const isSignedIn = props.variant === "signedIn";
  const settings = isSignedIn ? props.settings : null;

  const router = useRouter();
  const { signIn } = useAuthActions();
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const effectiveTimeZone = settings?.ianaTimezone ?? browserTimeZone;

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = dateKeyInTimeZone(selectedDate, effectiveTimeZone);

  const entry = useQuery(api.muhasabah.getDay, isSignedIn ? { dateKey } : "skip");
  const upsertDay = useMutation(api.mutations.upsertDay);
  const upsertUserSettings = useMutation(api.mutations.upsertUserSettings);
  const markSessionComplete = useMutation(api.mutations.markSessionComplete);

  const [form, setForm] = useState<EntryState>(defaultEntry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const prevDateKeyRef = useRef(dateKey);

  useEffect(() => {
    if (!isSignedIn) return;
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
  }, [isSignedIn, entry, dateKey]);

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
    setSlideIndex(0);
  }, [dateKey]);

  useEffect(() => {
    if (isSignedIn) return;
    const t = window.setTimeout(() => {
      saveDraftForDateKey(dateKey, form as LocalDraftShape);
    }, 350);
    return () => window.clearTimeout(t);
  }, [isSignedIn, dateKey, form]);

  useEffect(() => {
    if (!isSignedIn) return;
    const tz = browserTimeZone;
    if (!settings) {
      void upsertUserSettings({ ianaTimezone: tz });
      return;
    }
    if (settings.ianaTimezone !== tz) {
      void upsertUserSettings({ ianaTimezone: tz });
    }
  }, [isSignedIn, settings, upsertUserSettings, browserTimeZone]);

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
    if (!isSignedIn) return;
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
  }, [isSignedIn, dateKey, form, upsertDay, prayerNotYetNorm]);

  const saveAndCompleteSignedIn = useCallback(async () => {
    if (!isSignedIn) return;
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
  }, [isSignedIn, dateKey, form, upsertDay, markSessionComplete, router, prayerNotYetNorm]);

  const finishAnonymousLocal = useCallback(() => {
    saveDraftForDateKey(dateKey, form as LocalDraftShape);
    setLocalSessionCompleteForDate(dateKey);
    router.push("/dashboard");
  }, [dateKey, form, router]);

  const signInAfterAnonymousCompletion = useCallback(() => {
    saveDraftForDateKey(dateKey, form as LocalDraftShape);
    setLocalSessionCompleteForDate(dateKey);
    void signIn("google", { redirectTo: "/dashboard" });
  }, [dateKey, form, signIn]);

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
    setSlideIndex((i) => (i >= OUTRO_SLIDE ? i : i + 1));
  };

  const goPrev = () => {
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 dark:bg-gray-900 md:mx-auto md:min-h-screen md:max-w-lg md:shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4 pt-[max(0.5rem,env(safe-area-inset-top,0px))]"
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
              saving={saving}
              saved={saved}
              onSignInAfterAnonymousCompletion={signInAfterAnonymousCompletion}
              onFinishAnonymousLocal={finishAnonymousLocal}
              onSaveAndCompleteSignedIn={saveAndCompleteSignedIn}
              onSaveOnly={handleSave}
            />
          )}
        </main>
      </div>

      {slideIndex < OUTRO_SLIDE && (
        <nav
          className="shrink-0 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-gray-700 dark:bg-gray-800/95"
          aria-label={
            slideIndex >= 1 ? "Move between journal steps" : "Continue to next step"
          }
        >
          <div
            className={
              slideIndex >= 1 ? "flex min-h-[52px] gap-3" : "flex min-h-[52px]"
            }
          >
            {slideIndex >= 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="min-h-[52px] min-w-[5.5rem] shrink-0 rounded-2xl border-2 border-gray-300 bg-white text-base font-semibold text-gray-800 active:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className={`min-h-[52px] rounded-2xl bg-indigo-600 text-base font-semibold text-white active:bg-indigo-700 ${
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
