import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodayPage from "./page";
import { setLocalSessionCompleteForDate } from "@/lib/muhasabahLocalDraft";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";

const replace = vi.fn();

let authState = { isLoading: false, isAuthenticated: true, authToken: "firebase-id-token" };
let completedSignedIn: boolean | undefined = false;
let settings: unknown = null;

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
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/FirebaseAuthProvider", () => ({
  useFirebaseAuth: () => ({
    authToken: authState.authToken,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
  }),
}));

vi.mock("@/components/MuhasabahJournal", () => ({
  MuhasabahJournal: () => <div>Journal</div>,
}));

vi.mock("@/lib/useMuhasabahFirebase", () => ({
  useCompletedSession: () => completedSignedIn,
  useUserSettings: () => settings,
}));

describe("TodayPage authentication flow", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    localStorage.clear();
    replace.mockReset();
    authState = { isLoading: false, isAuthenticated: true, authToken: "firebase-id-token" };
    completedSignedIn = false;
    settings = null;
  });

  it("sends signed-in users with a completed local anonymous session to the dashboard for import", async () => {
    setLocalSessionCompleteForDate(getBrowserTodayDateKey());

    render(<TodayPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });

    expect(screen.queryByText("Journal")).not.toBeInTheDocument();
  });
});
