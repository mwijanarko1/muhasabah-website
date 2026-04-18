"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { MuhasabahJournal } from "@/components/MuhasabahJournal";
import { isLocalSessionCompleteForDate } from "@/lib/muhasabahLocalDraft";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import { useCompletedSession, useUserSettings } from "@/lib/useMuhasabahFirebase";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-white dark:bg-gray-950">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-accent border-t-transparent shadow-sm"></div>
        <p className="mt-4 font-display font-medium text-brand-ink dark:text-brand-mint">Loading...</p>
      </div>
    </div>
  );
}

function parseAllowReplayEdit(searchParams: ReturnType<typeof useSearchParams>): boolean {
  const v = searchParams.get("edit");
  return v === "1" || v === "true";
}

function TodayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allowReplayEdit = parseAllowReplayEdit(searchParams);
  const { authToken, isLoading, isAuthenticated } = useFirebaseAuth();
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const completedSignedIn = useCompletedSession(
    todayKey,
    !isLoading && isAuthenticated && todayKey !== null,
  );

  const settings = useUserSettings(!isLoading && isAuthenticated);
  const hasCompletedLocalSession = todayKey
    ? isLocalSessionCompleteForDate(todayKey)
    : false;

  useEffect(() => {
    if (!todayKey || isLoading || (authToken !== null && !isAuthenticated)) return;
    if (allowReplayEdit) return;

    if (isAuthenticated) {
      if (hasCompletedLocalSession) {
        router.replace("/dashboard");
        return;
      }
      if (completedSignedIn === undefined) return;
      if (completedSignedIn) {
        router.replace("/dashboard");
      }
    }
  }, [
    todayKey,
    isLoading,
    isAuthenticated,
    authToken,
    hasCompletedLocalSession,
    completedSignedIn,
    router,
    allowReplayEdit,
  ]);

  if (!todayKey || isLoading || (authToken !== null && !isAuthenticated)) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (!allowReplayEdit) {
      if (hasCompletedLocalSession) return <LoadingScreen />;
      if (completedSignedIn === undefined) return <LoadingScreen />;
      if (completedSignedIn) return <LoadingScreen />;
      if (settings === undefined) return <LoadingScreen />;
      return <MuhasabahJournal variant="signedIn" settings={settings} />;
    }
    // Edit mode: render journal immediately without waiting for queries to settle.
    // This prevents an unmount/remount cycle (via LoadingScreen) that would reset the
    // slide position and briefly show the anonymous OutroSlide to signed-in users.
    return <MuhasabahJournal variant="signedIn" settings={settings ?? null} />;
  }

  return <MuhasabahJournal variant="anonymous" />;
}

export default function TodayPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TodayPageInner />
    </Suspense>
  );
}
