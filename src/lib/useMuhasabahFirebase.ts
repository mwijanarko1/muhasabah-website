"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { fetchMuhasabahApi } from "./muhasabahApiClient";
import type { MuhasabahEntry, MuhasabahEntryInput, UserSettings } from "./muhasabahTypes";

function useAuthedQuery<T>(path: string | null) {
  const { getIdToken, isAuthenticated } = useFirebaseAuth();
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!path || !isAuthenticated) {
      setData(undefined);
      return;
    }

    setData(undefined);
    void fetchMuhasabahApi<T>(path, { getIdToken })
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to fetch synced journal data:", error);
          setData(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getIdToken, isAuthenticated, path]);

  return data;
}

export function useMuhasabahDay(dateKey: string | null, enabled: boolean) {
  return useAuthedQuery<MuhasabahEntry | null>(
    enabled && dateKey ? `/api/muhasabah/day/${dateKey}` : null,
  );
}

export function useRecentMuhasabahEntries(limit: number, enabled: boolean) {
  return useAuthedQuery<MuhasabahEntry[]>(
    enabled ? `/api/muhasabah/recent?limit=${encodeURIComponent(String(limit))}` : null,
  );
}

export function useUserSettings(enabled: boolean) {
  return useAuthedQuery<UserSettings | null>(enabled ? "/api/muhasabah/settings" : null);
}

export function useCompletedSession(dateKey: string | null, enabled: boolean) {
  return useAuthedQuery<boolean>(
    enabled && dateKey ? `/api/muhasabah/completions/${dateKey}` : null,
  );
}

export function useMuhasabahMutations() {
  const { getIdToken } = useFirebaseAuth();

  const upsertDay = useCallback(
    async (entry: MuhasabahEntryInput) => {
      return fetchMuhasabahApi<string>(`/api/muhasabah/day/${entry.dateKey}`, {
        getIdToken,
        json: {
          prayers: entry.prayers,
          prayerNotYetTime: entry.prayerNotYetTime,
          dhikrQuran: entry.dhikrQuran,
          ibadat: entry.ibadat,
          kindness: entry.kindness,
          learning: entry.learning,
          tongueDistractions: entry.tongueDistractions,
          heart: entry.heart,
          notes: entry.notes,
        },
        method: "PUT",
      });
    },
    [getIdToken],
  );

  const markSessionComplete = useCallback(
    async ({ dateKey }: { dateKey: string }) => {
      return fetchMuhasabahApi<string>(`/api/muhasabah/completions/${dateKey}`, {
        getIdToken,
        method: "PUT",
      });
    },
    [getIdToken],
  );

  const upsertUserSettings = useCallback(
    async ({ ianaTimezone }: { ianaTimezone: string }) => {
      return fetchMuhasabahApi<UserSettings>("/api/muhasabah/settings", {
        getIdToken,
        json: { ianaTimezone },
        method: "PUT",
      });
    },
    [getIdToken],
  );

  return useMemo(
    () => ({ markSessionComplete, upsertDay, upsertUserSettings }),
    [markSessionComplete, upsertDay, upsertUserSettings],
  );
}
