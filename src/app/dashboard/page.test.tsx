import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import {
  isLocalSessionCompleteForDate,
  loadAllDrafts,
  saveDraftForDateKey,
  setLocalSessionCompleteForDate,
} from "@/lib/muhasabahLocalDraft";
import { buildLocalDraftUpsertArgs } from "@/lib/localSessionSync";
import type { LocalDraftShape } from "@/lib/muhasabahLocalDraft";
import {
  clearTransientMuhasabahSession,
  getPendingAuthMuhasabahSession,
  storePendingAuthMuhasabahSession,
  clearPendingAuthMuhasabahSession,
  setTransientMuhasabahSession,
} from "@/lib/transientMuhasabahSession";

const replace = vi.fn();
const upsertDay = vi.fn();
const markSessionComplete = vi.fn();
const signOut = vi.fn();
const signInWithGoogle = vi.fn();

let authState = { isLoading: false, isAuthenticated: false };
let authToken: string | null = null;
let authError: string | null = null;
let completedSignedIn: boolean | undefined = false;
let todayRow: unknown = null;
let recentRows: unknown[] | undefined = [];

const localDraft: LocalDraftShape = {
  prayers: {
    fajr: 2,
    dhuhr: 2,
    asr: 2,
    maghrib: 2,
    isha: 2,
  },
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/FirebaseAuthProvider", () => ({
  useFirebaseAuth: () => ({
    authError,
    authToken,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    signInWithGoogle,
    signOut,
  }),
}));

vi.mock("@/lib/useMuhasabahFirebase", () => ({
  useCompletedSession: () => completedSignedIn,
  useMuhasabahDay: () => todayRow,
  useMuhasabahMutations: () => ({ markSessionComplete, upsertDay }),
  useRecentMuhasabahEntries: () => recentRows,
}));

describe("DashboardPage authentication state", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    localStorage.clear();
    replace.mockReset();
    upsertDay.mockReset();
    markSessionComplete.mockReset();
    signOut.mockReset();
    signInWithGoogle.mockReset();
    clearTransientMuhasabahSession();
    clearPendingAuthMuhasabahSession();
    upsertDay.mockResolvedValue("entry-id");
    markSessionComplete.mockResolvedValue("completion-id");
    signOut.mockResolvedValue(undefined);
    authState = { isLoading: false, isAuthenticated: false };
    authToken = null;
    authError = null;
    completedSignedIn = false;
    todayRow = null;
    recentRows = [];

    const todayKey = getBrowserTodayDateKey();
    saveDraftForDateKey(todayKey, localDraft);
    setLocalSessionCompleteForDate(todayKey);
  });

  it("shows an ephemeral anonymous dashboard with a prompt to sign in to save progress", async () => {
    localStorage.clear();
    const todayKey = getBrowserTodayDateKey();
    setTransientMuhasabahSession({ dateKey: todayKey, draft: localDraft });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /you're caught up for today/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/if you want to save your progress, sign in/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(upsertDay).not.toHaveBeenCalled();
    expect(markSessionComplete).not.toHaveBeenCalled();
  });

  it("shows Firebase auth errors on the temporary dashboard sign-in prompt", async () => {
    localStorage.clear();
    authError = "auth/unauthorized-domain: This domain is not authorized for OAuth operations.";
    const todayKey = getBrowserTodayDateKey();
    setTransientMuhasabahSession({ dateKey: todayKey, draft: localDraft });

    render(<DashboardPage />);

    expect(await screen.findByText(/auth\/unauthorized-domain/i)).toBeInTheDocument();
  });

  it("shows Firebase auth errors after returning to the dashboard with a pending save payload", async () => {
    localStorage.clear();
    authError = "auth/unauthorized-domain: This domain is not authorized for OAuth operations.";
    const todayKey = getBrowserTodayDateKey();
    storePendingAuthMuhasabahSession({ dateKey: todayKey, draft: localDraft });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /you're caught up for today/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/auth\/unauthorized-domain/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(signInWithGoogle).toHaveBeenCalledWith("/dashboard");
  });

  it("stores a pending Google-save payload without marking /today complete", async () => {
    localStorage.clear();
    const todayKey = getBrowserTodayDateKey();
    setTransientMuhasabahSession({ dateKey: todayKey, draft: localDraft });

    render(<DashboardPage />);

    fireEvent.click(await screen.findByRole("button", { name: /continue with google/i }));

    expect(signInWithGoogle).toHaveBeenCalledWith("/dashboard");
    expect(isLocalSessionCompleteForDate(todayKey)).toBe(false);
    expect(loadAllDrafts()[todayKey]).toBeUndefined();
    expect(getPendingAuthMuhasabahSession()).toEqual({ dateKey: todayKey, draft: localDraft });
  });

  it("imports the pending Google-save payload after auth reaches the dashboard", async () => {
    localStorage.clear();
    authState = { isLoading: false, isAuthenticated: true };
    const todayKey = getBrowserTodayDateKey();
    storePendingAuthMuhasabahSession({ dateKey: todayKey, draft: localDraft });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(upsertDay).toHaveBeenCalledWith(buildLocalDraftUpsertArgs(todayKey, localDraft));
    });
    expect(markSessionComplete).toHaveBeenCalledWith({ dateKey: todayKey });
    expect(getPendingAuthMuhasabahSession()).toBeNull();
  });

  it("clears a stale Firebase auth token immediately instead of sending protected mutations", async () => {
    authToken = "firebase-id-token";

    render(<DashboardPage />);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    expect(replace).toHaveBeenCalledWith("/today");
    expect(upsertDay).not.toHaveBeenCalled();
    expect(markSessionComplete).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it("redirects anonymous completed local users back to the journal instead of showing the dashboard", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/today");
    });

    expect(screen.queryByRole("heading", { name: /you're caught up for today/i })).not.toBeInTheDocument();
  });

  it("imports the completed local draft after Google auth reaches the dashboard", async () => {
    authState = { isLoading: false, isAuthenticated: true };

    render(<DashboardPage />);

    const todayKey = getBrowserTodayDateKey();
    await waitFor(() => {
      expect(upsertDay).toHaveBeenCalledWith(buildLocalDraftUpsertArgs(todayKey, localDraft));
    });
    expect(markSessionComplete).toHaveBeenCalledWith({ dateKey: todayKey });
  });

  it("starts importing the completed local draft even while synced reads are still pending", async () => {
    authState = { isLoading: false, isAuthenticated: true };
    completedSignedIn = undefined;
    todayRow = undefined;
    recentRows = undefined;

    render(<DashboardPage />);

    const todayKey = getBrowserTodayDateKey();
    await waitFor(() => {
      expect(upsertDay).toHaveBeenCalledWith(buildLocalDraftUpsertArgs(todayKey, localDraft));
    });
    expect(markSessionComplete).toHaveBeenCalledWith({ dateKey: todayKey });
  });

  it("starts the completed local draft import only once under repeated effect execution", async () => {
    authState = { isLoading: false, isAuthenticated: true };

    render(
      <StrictMode>
        <DashboardPage />
      </StrictMode>,
    );

    const todayKey = getBrowserTodayDateKey();
    await waitFor(() => {
      expect(upsertDay).toHaveBeenCalledWith(buildLocalDraftUpsertArgs(todayKey, localDraft));
    });

    await waitFor(() => {
      expect(upsertDay).toHaveBeenCalledTimes(1);
      expect(markSessionComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("shows the dashboard from the completed local session while synced reads are still pending", async () => {
    authState = { isLoading: false, isAuthenticated: true };
    completedSignedIn = undefined;
    todayRow = undefined;
    recentRows = undefined;

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: /you're caught up for today/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("lets authenticated users sign out from the profile menu", async () => {
    authState = { isLoading: false, isAuthenticated: true };

    render(<DashboardPage />);

    fireEvent.click(await screen.findByRole("button", { name: /profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("shows notes from the saved dashboard entry", async () => {
    authState = { isLoading: false, isAuthenticated: true };
    completedSignedIn = true;
    const todayKey = getBrowserTodayDateKey();
    todayRow = {
      ...localDraft,
      dateKey: todayKey,
      notes: { dhikrQuran: "Stayed present during morning recitation." },
      updatedAt: 1,
    };

    render(<DashboardPage />);

    expect(
      await screen.findByText("Stayed present during morning recitation."),
    ).toBeInTheDocument();
  });
});
