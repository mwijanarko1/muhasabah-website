"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import { useCompletedSession } from "@/lib/useMuhasabahFirebase";

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

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useFirebaseAuth();
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const completedSignedIn = useCompletedSession(
    todayKey,
    !isLoading && isAuthenticated && todayKey !== null,
  );

  useEffect(() => {
    if (!todayKey || isLoading) return;

    if (isAuthenticated) {
      if (completedSignedIn === undefined) return;
      if (completedSignedIn) {
        router.replace("/dashboard");
      }
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

  return <LandingPage />;
}
