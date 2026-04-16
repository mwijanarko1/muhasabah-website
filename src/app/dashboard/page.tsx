"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import {
  isLocalSessionCompleteForDate,
  loadAllDrafts,
  loadLocalCompletedDateKeys,
  type LocalDraftShape,
} from "@/lib/muhasabahLocalDraft";
import { buildLocalDraftUpsertArgs } from "@/lib/localSessionSync";
import { normalizePrayerNotYetTime } from "../../../convex/helpers";
import {
  buildActivityDays,
  buildCategoryCards,
  buildDashboardStatStrip,
  type EntryScores,
} from "@/lib/dashboardStats";
import { DashboardKanban } from "@/components/DashboardKanban";

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
  };
}

function rowToEntry(row: Doc<"muhasabahEntries">): EntryScores {
  return {
    prayers: row.prayers,
    prayerNotYetTime: normalizePrayerNotYetTime(row.prayerNotYetTime),
    dhikrQuran: row.dhikrQuran,
    ibadat: row.ibadat,
    kindness: row.kindness,
    learning: row.learning,
    tongueDistractions: row.tongueDistractions,
    heart: row.heart,
  };
}

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

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const upsertDay = useMutation(api.mutations.upsertDay);
  const markSessionComplete = useMutation(api.mutations.markSessionComplete);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [localEntry, setLocalEntry] = useState<EntryScores | null>(null);
  const [localEntriesMap, setLocalEntriesMap] = useState<Map<string, EntryScores>>(new Map());
  const [localReady, setLocalReady] = useState(false);
  const [importedLocalEntry, setImportedLocalEntry] = useState<EntryScores | null>(null);
  const [isImportingLocalCompletion, setIsImportingLocalCompletion] = useState(false);
  const [importedLocalCompletionDateKey, setImportedLocalCompletionDateKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(getBrowserTodayDateKey());
  }, []);

  const recentRows = useQuery(api.muhasabah.listRecent, isAuthenticated ? { limit: 90 } : "skip");

  const todayRow = useQuery(
    api.muhasabah.getDay,
    isAuthenticated && todayKey ? { dateKey: todayKey } : "skip",
  );

  const completedSignedIn = useQuery(
    api.muhasabah.hasCompletedSessionForDate,
    isAuthenticated && todayKey ? { dateKey: todayKey } : "skip",
  );

  useEffect(() => {
    if (isAuthenticated) {
      setLocalReady(true);
      return;
    }
    if (!todayKey) return;
    try {
      const all = loadAllDrafts();
      const keys = loadLocalCompletedDateKeys().filter((key) => all[key] !== undefined);
      const m = new Map<string, EntryScores>();
      for (const k of keys) {
        const d = all[k];
        if (d) m.set(k, localDraftToEntry(d));
      }
      setLocalEntriesMap(m);
      const todayDraft = all[todayKey];
      setLocalEntry(todayDraft ? localDraftToEntry(todayDraft) : null);
    } finally {
      setLocalReady(true);
    }
  }, [isAuthenticated, todayKey]);

  useEffect(() => {
    if (!todayKey || isLoading) return;

    if (isAuthenticated) {
      return;
    }

    if (!isLocalSessionCompleteForDate(todayKey)) {
      router.replace("/today");
    }
  }, [todayKey, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (
      !todayKey ||
      isLoading ||
      !isAuthenticated ||
      completedSignedIn === undefined ||
      todayRow === undefined ||
      importedLocalCompletionDateKey === todayKey ||
      isImportingLocalCompletion ||
      !isLocalSessionCompleteForDate(todayKey)
    ) {
      return;
    }

    const draft = loadAllDrafts()[todayKey];
    if (!draft && completedSignedIn) {
      return;
    }

    setIsImportingLocalCompletion(true);

    void (async () => {
      try {
        if (!todayRow && draft) {
          setImportedLocalEntry(localDraftToEntry(draft));
          await upsertDay(buildLocalDraftUpsertArgs(todayKey, draft));
        }
        if (!completedSignedIn) {
          await markSessionComplete({ dateKey: todayKey });
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
    importedLocalCompletionDateKey,
    isImportingLocalCompletion,
    upsertDay,
    markSessionComplete,
  ]);

  const syncedEntriesByDate = useMemo(() => {
    const m = new Map<string, EntryScores>();
    if (recentRows) {
      for (const row of recentRows) {
        m.set(row.dateKey, rowToEntry(row));
      }
    }
    if (todayKey && todayRow) {
      m.set(todayKey, rowToEntry(todayRow));
    } else if (todayKey && importedLocalEntry) {
      m.set(todayKey, importedLocalEntry);
    }
    return m;
  }, [recentRows, todayRow, todayKey, importedLocalEntry]);

  const entryForToday = useMemo((): EntryScores | null => {
    if (isAuthenticated) {
      if (todayRow) return rowToEntry(todayRow);
      if (importedLocalEntry) return importedLocalEntry;
      return null;
    }
    return localEntry;
  }, [isAuthenticated, todayRow, importedLocalEntry, localEntry]);

  const entriesByDateForAvg = isAuthenticated ? syncedEntriesByDate : localEntriesMap;

  const hasCompletedToday = isAuthenticated
    ? completedSignedIn === true || importedLocalCompletionDateKey === todayKey
    : true;

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
    const dataSourceLabel = isAuthenticated ? "Synced entries (recent fetch)" : "Saved on this device only";
    return buildDashboardStatStrip(todayKey, entriesByDateForAvg, entryForToday, dataSourceLabel);
  }, [todayKey, entriesByDateForAvg, entryForToday, isAuthenticated]);

  const categoryCards = useMemo(
    () => (entryForToday ? buildCategoryCards(entryForToday) : []),
    [entryForToday],
  );

  const activityDays = useMemo(
    () => (todayKey ? buildActivityDays(todayKey, entriesByDateForAvg, 13) : []),
    [todayKey, entriesByDateForAvg],
  );

  if (!todayKey || isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (
      recentRows === undefined ||
      todayRow === undefined ||
      completedSignedIn === undefined ||
      isImportingLocalCompletion
    ) {
      return <LoadingScreen />;
    }
  } else {
    if (!isLocalSessionCompleteForDate(todayKey)) return <LoadingScreen />;
    if (!localReady) return <LoadingScreen />;
  }

  return (
    <DashboardKanban
      statStrip={statStrip}
      cards={categoryCards}
      activityDays={activityDays}
      hasCompletedToday={hasCompletedToday}
    />
  );
}
