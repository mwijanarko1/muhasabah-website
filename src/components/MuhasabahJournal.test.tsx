import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MuhasabahJournal } from "./MuhasabahJournal";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import {
  isLocalSessionCompleteForDate,
  loadAllDrafts,
  saveDraftForDateKey,
  setLocalSessionCompleteForDate,
  type LocalDraftShape,
} from "@/lib/muhasabahLocalDraft";
import {
  clearTransientMuhasabahSession,
  getTransientMuhasabahSession,
} from "@/lib/transientMuhasabahSession";

const signIn = vi.fn();
const upsertDay = vi.fn();
const upsertUserSettings = vi.fn();
const markSessionComplete = vi.fn();
const push = vi.fn();
let authToken: string | null = null;
let authState = { isLoading: false, isAuthenticated: false };

const localDraft: LocalDraftShape = {
  prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
  dhikrQuran: 8,
  ibadat: 8,
  kindness: 15,
  learning: 8,
  tongueDistractions: 5,
  heart: 16,
  notes: {},
};

function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store = new Map();
    },
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

vi.mock("@/components/FirebaseAuthProvider", () => ({
  useFirebaseAuth: () => ({
    authToken,
    isAuthenticated: authState.isAuthenticated,
    signInWithGoogle: signIn,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/useMuhasabahFirebase", () => ({
  useMuhasabahDay: () => null,
  useMuhasabahMutations: () => ({
    markSessionComplete,
    upsertDay,
    upsertUserSettings,
  }),
  useUserSettings: () => null,
}));

describe("MuhasabahJournal", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    localStorage.clear();
    signIn.mockReset();
    upsertDay.mockReset();
    upsertUserSettings.mockReset();
    markSessionComplete.mockReset();
    push.mockReset();
    clearTransientMuhasabahSession();
    authToken = null;
    authState = { isLoading: false, isAuthenticated: false };
  });

  it("opens an ephemeral dashboard after anonymous completion without saving local completion", () => {
    render(<MuhasabahJournal variant="anonymous" />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    for (let i = 0; i < 7; i++) {
      fireEvent.click(continueButton);
    }

    const todayKey = getBrowserTodayDateKey();
    expect(isLocalSessionCompleteForDate(todayKey)).toBe(false);
    expect(loadAllDrafts()[todayKey]).toBeUndefined();
    expect(getTransientMuhasabahSession()?.dateKey).toBe(todayKey);
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does not stop on a Google sign-in prompt after anonymous completion", () => {
    render(<MuhasabahJournal variant="anonymous" />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    for (let i = 0; i < 7; i++) {
      fireEvent.click(continueButton);
    }

    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("keeps the outro in the signed-in state while Firebase auth is settling", () => {
    authToken = "firebase-id-token";

    render(<MuhasabahJournal variant="anonymous" />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    for (let i = 0; i < 7; i++) {
      fireEvent.click(continueButton);
    }

    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /save and open your dashboard/i }),
    ).toBeInTheDocument();
  });

  it("restores a completed anonymous local session at the Google sign-in prompt", () => {
    const todayKey = getBrowserTodayDateKey();
    saveDraftForDateKey(todayKey, localDraft);
    setLocalSessionCompleteForDate(todayKey);

    render(<MuhasabahJournal variant="anonymous" />);

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^continue$/i })).not.toBeInTheDocument();
  });

  it("lets anonymous users start today's completed local session over", () => {
    const todayKey = getBrowserTodayDateKey();
    saveDraftForDateKey(todayKey, localDraft);
    setLocalSessionCompleteForDate(todayKey);

    render(<MuhasabahJournal variant="anonymous" />);

    fireEvent.click(screen.getByRole("button", { name: /start over/i }));

    expect(isLocalSessionCompleteForDate(todayKey)).toBe(false);
    expect(loadAllDrafts()[todayKey]).toBeUndefined();
    expect(screen.getByRole("button", { name: /^continue$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
  });
});
