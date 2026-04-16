"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MuhasabahJournal } from "@/components/MuhasabahJournal";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import { isLocalSessionCompleteForDate } from "@/lib/muhasabahLocalDraft";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const completedSignedIn = useQuery(
    api.muhasabah.hasCompletedSessionForDate,
    isLoading || !isAuthenticated || !todayKey ? "skip" : { dateKey: todayKey },
  );

  const settings = useQuery(
    api.muhasabah.getUserSettings,
    isLoading || !isAuthenticated ? "skip" : {},
  );

  useEffect(() => {
    if (!todayKey || isLoading) return;
    if (allowReplayEdit) return;

    if (isAuthenticated) {
      if (completedSignedIn === undefined) return;
      if (completedSignedIn) {
        router.replace("/dashboard");
      }
      return;
    }

    if (isLocalSessionCompleteForDate(todayKey)) {
      router.replace("/dashboard");
    }
  }, [todayKey, isLoading, isAuthenticated, completedSignedIn, router, allowReplayEdit]);

  if (!todayKey || isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (completedSignedIn === undefined) return <LoadingScreen />;
    if (completedSignedIn && !allowReplayEdit) return <LoadingScreen />;
    if (settings === undefined) return <LoadingScreen />;
    return <MuhasabahJournal variant="signedIn" settings={settings} />;
  }

  if (isLocalSessionCompleteForDate(todayKey) && !allowReplayEdit) {
    return <LoadingScreen />;
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
