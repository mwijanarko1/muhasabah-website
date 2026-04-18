const DRAFTS_KEY = "muhasabah-local-drafts-v1";
const SESSION_DONE_PREFIX = "muhasabah-session-done-v1::";

export type LocalDraftShape = {
  prayers: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  /** Optional — when missing, treated as all false. */
  prayerNotYetTime?: {
    fajr?: boolean;
    dhuhr?: boolean;
    asr?: boolean;
    maghrib?: boolean;
    isha?: boolean;
  };
  dhikrQuran: number;
  ibadat: number;
  kindness: number;
  learning: number;
  tongueDistractions: number;
  heart: number;
  notes: {
    dhikrQuran?: string;
    ibadat?: string;
    kindness?: string;
    learning?: string;
    tongue?: string;
    heart?: string;
  };
};

export function loadAllDrafts(): Record<string, LocalDraftShape> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalDraftShape>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDraftForDateKey(dateKey: string, draft: LocalDraftShape): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllDrafts();
    all[dateKey] = draft;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private mode
  }
}

export function clearDraftForDateKey(dateKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllDrafts();
    delete all[dateKey];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / private mode
  }
}

export function isLocalSessionCompleteForDate(dateKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${SESSION_DONE_PREFIX}${dateKey}`) === "1";
  } catch {
    return false;
  }
}

export function loadLocalCompletedDateKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SESSION_DONE_PREFIX) && localStorage.getItem(key) === "1") {
        keys.push(key.slice(SESSION_DONE_PREFIX.length));
      }
    }
    return keys;
  } catch {
    return [];
  }
}

export function setLocalSessionCompleteForDate(dateKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${SESSION_DONE_PREFIX}${dateKey}`, "1");
  } catch {
    // ignore
  }
}

export function clearLocalSessionCompleteForDate(dateKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${SESSION_DONE_PREFIX}${dateKey}`);
  } catch {
    // ignore
  }
}

export function resetLocalSessionForDate(dateKey: string): void {
  clearDraftForDateKey(dateKey);
  clearLocalSessionCompleteForDate(dateKey);
}
