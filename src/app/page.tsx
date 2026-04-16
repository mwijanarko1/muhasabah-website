"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LandingPage } from "@/components/LandingPage";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import { isLocalSessionCompleteForDate } from "@/lib/muhasabahLocalDraft";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mint dark:bg-[#1a1423]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
        <p className="mt-4 text-brand-ink/80 dark:text-brand-mint/80">Loading...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const completedSignedIn = useQuery(
    api.muhasabah.hasCompletedSessionForDate,
    isLoading || !isAuthenticated || !todayKey ? "skip" : { dateKey: todayKey },
  );

  useEffect(() => {
    if (!todayKey || isLoading) return;

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
  }, [todayKey, isLoading, isAuthenticated, completedSignedIn, router]);

  if (!todayKey || isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (completedSignedIn === undefined) return <LoadingScreen />;
    if (completedSignedIn) return <LoadingScreen />;
    return <LandingPage />;
  }

  if (isLocalSessionCompleteForDate(todayKey)) {
    return <LoadingScreen />;
  }

  return <LandingPage />;
}
