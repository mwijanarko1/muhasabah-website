"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import {
  isLocalSessionCompleteForDate,
  loadAllDrafts,
  type LocalDraftShape,
} from "@/lib/muhasabahLocalDraft";
import { buildLocalDraftUpsertArgs } from "@/lib/localSessionSync";
import { normalizePrayerNotYetTime } from "@/lib/muhasabahScoring";
import type { MuhasabahEntry } from "@/lib/muhasabahTypes";
import {
  clearPendingAuthMuhasabahSession,
  getPendingAuthMuhasabahSession,
  getTransientMuhasabahSession,
  storePendingAuthMuhasabahSession,
} from "@/lib/transientMuhasabahSession";
import {
  addDaysToDateKey,
  buildActivityDays,
  buildCategoryCards,
  buildDashboardStatStrip,
  type EntryScores,
} from "@/lib/dashboardStats";
import { DashboardKanban } from "@/components/DashboardKanban";
import {
  useCompletedSession,
  useMuhasabahDay,
  useMuhasabahMutations,
  useRecentMuhasabahEntries,
} from "@/lib/useMuhasabahFirebase";

function localDraftToEntry(d: LocalDraftShape): EntryScores {
  return {
    prayers: d.prayers,
    prayerNotYetTime: normalizePrayerNotYetTime(d.prayerNotYetTime),
    dhikrQuran: d.dhikrQuran,
    ibadat: d.ibadat,
    kindness: d.kindness,
    learning: d.learning,
    tongueDistractions: d.tongueDistractions,
    heart: d.heart,
    notes: d.notes,
  };
}

function rowToEntry(row: MuhasabahEntry): EntryScores {
  return {
    prayers: row.prayers,
    prayerNotYetTime: normalizePrayerNotYetTime(row.prayerNotYetTime),
    dhikrQuran: row.dhikrQuran,
    ibadat: row.ibadat,
    kindness: row.kindness,
    learning: row.learning,
    tongueDistractions: row.tongueDistractions,
    heart: row.heart,
    notes: row.notes,
  };
}

const KANBAN_HISTORY_DAYS = 120;

function formatKanbanDateLabel(
  viewKey: string,
  todayKey: string,
): { label: string; isToday: boolean } {
  if (viewKey === todayKey) return { label: "Today", isToday: true };
  const [y, m, d] = viewKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    label: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    isToday: false,
  };
}

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

export default function DashboardPage() {
  const router = useRouter();
  const { authError, authToken, isLoading, isAuthenticated, signInWithGoogle, signOut } = useFirebaseAuth();
  const { markSessionComplete, upsertDay } = useMuhasabahMutations();
  const transientSession = getTransientMuhasabahSession();
  const [pendingAuthSession, setPendingAuthSession] = useState(() => getPendingAuthMuhasabahSession());
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [importedLocalEntry, setImportedLocalEntry] = useState<EntryScores | null>(null);
  const [isImportingLocalCompletion, setIsImportingLocalCompletion] = useState(false);
  const [importedLocalCompletionDateKey, setImportedLocalCompletionDateKey] = useState<string | null>(null);
  const [completedLocalDateKey, setCompletedLocalDateKey] = useState<string | null>(null);
  const hasHandledAuthFailureRef = useRef(false);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const recentRows = useRecentMuhasabahEntries(90, isAuthenticated);

  const todayRow = useMuhasabahDay(todayKey, isAuthenticated && todayKey !== null);

  const completedSignedIn = useCompletedSession(todayKey, isAuthenticated && todayKey !== null);

  useEffect(() => {
    if (!todayKey || isLoading || !isAuthenticated) return;

    if (!isLocalSessionCompleteForDate(todayKey)) {
      setCompletedLocalDateKey((current) => (current === todayKey ? null : current));
      return;
    }

    setCompletedLocalDateKey(todayKey);
    const draft = loadAllDrafts()[todayKey];
    if (draft) {
      setImportedLocalEntry(localDraftToEntry(draft));
    }
  }, [todayKey, isLoading, isAuthenticated]);

  useEffect(() => {
    if (
      !todayKey ||
      isLoading ||
      isAuthenticated ||
      transientSession !== null ||
      hasHandledAuthFailureRef.current
    ) {
      return;
    }
    hasHandledAuthFailureRef.current = true;
    if (authToken === null) {
      router.replace("/today");
      return;
    }
    void signOut()
      .catch((error) => {
        console.error("Failed to clear stale auth token:", error);
      })
      .finally(() => {
        router.replace("/today");
      });
  }, [todayKey, isLoading, isAuthenticated, transientSession, authToken, signOut, router]);

  useEffect(() => {
    if (
      !todayKey ||
      isLoading ||
      !isAuthenticated ||
      importedLocalCompletionDateKey === todayKey ||
      isImportingLocalCompletion ||
      !isLocalSessionCompleteForDate(todayKey) &&
      pendingAuthSession?.dateKey !== todayKey
    ) {
      return;
    }

    const draft =
      pendingAuthSession?.dateKey === todayKey
        ? pendingAuthSession.draft
        : loadAllDrafts()[todayKey];
    if (!draft && completedSignedIn) {
      setImportedLocalCompletionDateKey(todayKey);
      return;
    }

    if (!draft && !completedSignedIn) {
      setIsImportingLocalCompletion(true);
      void markSessionComplete({ dateKey: todayKey })
        .then(() => {
          setImportedLocalCompletionDateKey(todayKey);
        })
        .catch((error) => {
          console.error("Failed to sync local completion:", error);
        })
        .finally(() => {
          setIsImportingLocalCompletion(false);
        });
      return;
    }

    if (!draft) return;

    setIsImportingLocalCompletion(true);

    void (async () => {
      try {
        if (!todayRow) {
          setImportedLocalEntry(localDraftToEntry(draft));
          await upsertDay(buildLocalDraftUpsertArgs(todayKey, draft));
        }
        if (!completedSignedIn) {
          await markSessionComplete({ dateKey: todayKey });
        }
        if (pendingAuthSession?.dateKey === todayKey) {
          clearPendingAuthMuhasabahSession();
          setPendingAuthSession(null);
        }
        setImportedLocalCompletionDateKey(todayKey);
      } catch (error) {
        console.error("Failed to sync local completion:", error);
      } finally {
        setIsImportingLocalCompletion(false);
      }
    })();
  }, [
    todayKey,
    isLoading,
    isAuthenticated,
    completedSignedIn,
    todayRow,
    pendingAuthSession,
    importedLocalCompletionDateKey,
    isImportingLocalCompletion,
    upsertDay,
    markSessionComplete,
  ]);

  useEffect(() => {
    if (!todayKey || isLoading || !isAuthenticated || completedSignedIn === undefined) return;
    if (completedSignedIn || importedLocalCompletionDateKey === todayKey) return;
    if (isLocalSessionCompleteForDate(todayKey)) return;
    if (pendingAuthSession?.dateKey === todayKey) return;
    router.replace("/today");
  }, [
    todayKey,
    isLoading,
    isAuthenticated,
    completedSignedIn,
    importedLocalCompletionDateKey,
    pendingAuthSession,
    router,
  ]);

  const syncedEntriesByDate = useMemo(() => {
    const m = new Map<string, EntryScores>();
    const transientEntryForToday =
      todayKey && transientSession?.dateKey === todayKey
        ? localDraftToEntry(transientSession.draft)
        : null;
    const pendingEntryForToday =
      todayKey && pendingAuthSession?.dateKey === todayKey
        ? localDraftToEntry(pendingAuthSession.draft)
        : null;
    const localEntryForToday =
      todayKey &&
      (completedLocalDateKey === todayKey || importedLocalCompletionDateKey === todayKey)
        ? importedLocalEntry
        : null;
    if (recentRows) {
      for (const row of recentRows) {
        m.set(row.dateKey, rowToEntry(row));
      }
    }
    if (todayKey && todayRow) {
      m.set(todayKey, rowToEntry(todayRow));
    } else if (todayKey && pendingEntryForToday) {
      m.set(todayKey, pendingEntryForToday);
    } else if (todayKey && transientEntryForToday) {
      m.set(todayKey, transientEntryForToday);
    } else if (todayKey && localEntryForToday) {
      m.set(todayKey, localEntryForToday);
    }
    return m;
  }, [
    recentRows,
    todayRow,
    todayKey,
    completedLocalDateKey,
    importedLocalCompletionDateKey,
    importedLocalEntry,
    pendingAuthSession,
    transientSession,
  ]);

  const entryForToday = useMemo((): EntryScores | null => {
    if (todayRow) return rowToEntry(todayRow);
    if (todayKey && pendingAuthSession?.dateKey === todayKey) {
      return localDraftToEntry(pendingAuthSession.draft);
    }
    if (todayKey && transientSession?.dateKey === todayKey) {
      return localDraftToEntry(transientSession.draft);
    }
    if (
      todayKey &&
      (completedLocalDateKey === todayKey || importedLocalCompletionDateKey === todayKey) &&
      importedLocalEntry
    ) {
      return importedLocalEntry;
    }
    return null;
  }, [
    todayRow,
    todayKey,
    pendingAuthSession,
    transientSession,
    completedLocalDateKey,
    importedLocalCompletionDateKey,
    importedLocalEntry,
  ]);

  const entriesByDateForAvg = syncedEntriesByDate;

  const [kanbanViewKey, setKanbanViewKey] = useState<string | null>(null);

  useEffect(() => {
    if (!todayKey) return;
    setKanbanViewKey((v) => (v === null ? todayKey : v > todayKey ? todayKey : v));
  }, [todayKey]);

  const activeKanbanKey = kanbanViewKey ?? todayKey ?? "";

  const minKanbanKey = useMemo(
    () => (todayKey ? addDaysToDateKey(todayKey, -KANBAN_HISTORY_DAYS) : ""),
    [todayKey],
  );

  const entryForKanban = useMemo((): EntryScores | null => {
    if (!todayKey || !activeKanbanKey) return null;
    return entriesByDateForAvg.get(activeKanbanKey) ?? null;
  }, [entriesByDateForAvg, activeKanbanKey, todayKey]);

  const { label: kanbanDateLabel, isToday: kanbanIsToday } = useMemo(
    () =>
      todayKey && activeKanbanKey
        ? formatKanbanDateLabel(activeKanbanKey, todayKey)
        : { label: "Today", isToday: true },
    [activeKanbanKey, todayKey],
  );

  const goKanbanOlder = useCallback(() => {
    if (!minKanbanKey || !todayKey) return;
    setKanbanViewKey((v) => {
      const cur = v ?? todayKey;
      const n = addDaysToDateKey(cur, -1);
      return n >= minKanbanKey ? n : cur;
    });
  }, [minKanbanKey, todayKey]);

  const goKanbanNewer = useCallback(() => {
    if (!todayKey) return;
    setKanbanViewKey((v) => {
      const cur = v ?? todayKey;
      const n = addDaysToDateKey(cur, 1);
      return n <= todayKey ? n : cur;
    });
  }, [todayKey]);

  const kanbanDayNavigation = useMemo(() => {
    if (!todayKey || !minKanbanKey || !activeKanbanKey) return undefined;
    return {
      dateLabel: kanbanDateLabel,
      isToday: kanbanIsToday,
      onPreviousDay: goKanbanOlder,
      onNextDay: goKanbanNewer,
      canGoPrevious: activeKanbanKey > minKanbanKey,
      canGoNext: activeKanbanKey < todayKey,
    };
  }, [
    todayKey,
    minKanbanKey,
    activeKanbanKey,
    kanbanDateLabel,
    kanbanIsToday,
    goKanbanOlder,
    goKanbanNewer,
  ]);

  const hasCompletedToday =
    completedSignedIn === true ||
    pendingAuthSession?.dateKey === todayKey ||
    transientSession?.dateKey === todayKey ||
    importedLocalCompletionDateKey === todayKey ||
    completedLocalDateKey === todayKey;

  const canRenderCompletedLocalDashboard =
    completedLocalDateKey === todayKey ||
    pendingAuthSession?.dateKey === todayKey ||
    transientSession?.dateKey === todayKey;

  const statStrip = useMemo(() => {
    if (!todayKey) {
      return {
        todayTotal: null as number | null,
        streak: 0,
        weekAverage: null as number | null,
        weekDaysWithData: 0,
        daysLogged: 0,
        dataSourceLabel: "",
      };
    }
    const dataSourceLabel =
      pendingAuthSession?.dateKey === todayKey
        ? "Saving to your account"
        : transientSession?.dateKey === todayKey
        ? "Temporary dashboard"
        : canRenderCompletedLocalDashboard && recentRows === undefined
          ? "Saved on this device; syncing"
        : "Synced entries (recent fetch)";
    return buildDashboardStatStrip(todayKey, entriesByDateForAvg, entryForToday, dataSourceLabel);
  }, [
    todayKey,
    entriesByDateForAvg,
    entryForToday,
    canRenderCompletedLocalDashboard,
    recentRows,
    pendingAuthSession,
    transientSession,
  ]);

  const categoryCards = useMemo(
    () => (entryForKanban ? buildCategoryCards(entryForKanban) : []),
    [entryForKanban],
  );

  const activityDays = useMemo(
    () => (todayKey ? buildActivityDays(todayKey, entriesByDateForAvg, 13) : []),
    [todayKey, entriesByDateForAvg],
  );

  if (!todayKey || isLoading) {
    return <LoadingScreen />;
  }

  const saveTransientProgressWithGoogle = () => {
    const sessionToSave = transientSession ?? pendingAuthSession;
    if (!sessionToSave) return;
    storePendingAuthMuhasabahSession(sessionToSave);
    setPendingAuthSession(sessionToSave);
    void signInWithGoogle("/dashboard");
  };

  if (!isAuthenticated && transientSession === null && pendingAuthSession === null) {
    return <LoadingScreen />;
  }

  if (
    !canRenderCompletedLocalDashboard &&
    (recentRows === undefined ||
      todayRow === undefined ||
      completedSignedIn === undefined ||
      isImportingLocalCompletion)
  ) {
    return <LoadingScreen />;
  }

  return (
    <DashboardKanban
      statStrip={statStrip}
      cards={categoryCards}
      activityDays={activityDays}
      hasCompletedToday={hasCompletedToday}
      profileMenu={isAuthenticated ? { onSignOut: () => void signOut() } : undefined}
      savePrompt={
        !isAuthenticated && (transientSession !== null || pendingAuthSession !== null)
          ? { authError, onSignIn: saveTransientProgressWithGoogle }
          : undefined
      }
      kanbanDayNavigation={kanbanDayNavigation}
    />
  );
}
