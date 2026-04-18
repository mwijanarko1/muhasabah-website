import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MuhasabahJournal } from "./MuhasabahJournal";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import type { MuhasabahEntry } from "@/lib/muhasabahTypes";
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
  setTransientMuhasabahSession,
} from "@/lib/transientMuhasabahSession";

const signIn = vi.fn();
const upsertDay = vi.fn();
const upsertUserSettings = vi.fn();
const markSessionComplete = vi.fn();
const push = vi.fn();
let authToken: string | null = null;
let authState = { isLoading: false, isAuthenticated: false };
let syncedDay: MuhasabahEntry | null | undefined = null;

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
  useMuhasabahDay: () => syncedDay,
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
    syncedDay = null;
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

  it("restores temporary anonymous dashboard progress when returning to edit", async () => {
    const todayKey = getBrowserTodayDateKey();
    setTransientMuhasabahSession({
      dateKey: todayKey,
      draft: {
        ...localDraft,
        notes: { dhikrQuran: "Edited from the temporary dashboard." },
      },
    });

    render(<MuhasabahJournal variant="anonymous" />);

    await waitFor(() => {
      expect(screen.getAllByText("2/2")).toHaveLength(5);
    });

    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(screen.getByLabelText("Dhikr and Quran score")).toHaveValue("8");
    expect(
      screen.getByDisplayValue("Edited from the temporary dashboard."),
    ).toBeInTheDocument();
  });

  it("waits for today's signed-in entry before showing editable scores", async () => {
    const todayKey = getBrowserTodayDateKey();
    authState = { isLoading: false, isAuthenticated: true };
    syncedDay = undefined;

    const { rerender } = render(
      <MuhasabahJournal
        variant="signedIn"
        settings={{ ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, updatedAt: 1 }}
      />,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText("Missed")).not.toBeInTheDocument();

    syncedDay = {
      dateKey: todayKey,
      prayers: { fajr: 2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 },
      prayerNotYetTime: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      },
      dhikrQuran: localDraft.dhikrQuran,
      ibadat: localDraft.ibadat,
      kindness: localDraft.kindness,
      learning: localDraft.learning,
      tongueDistractions: localDraft.tongueDistractions,
      heart: localDraft.heart,
      notes: { dhikrQuran: "Steady morning recitation." },
      updatedAt: 1,
    };

    rerender(
      <MuhasabahJournal
        variant="signedIn"
        settings={{ ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, updatedAt: 1 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText("2/2")).toHaveLength(5);
    });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByLabelText("Dhikr and Quran score")).toHaveValue("8");
    expect(screen.getByDisplayValue("Steady morning recitation.")).toBeInTheDocument();
  });
});
