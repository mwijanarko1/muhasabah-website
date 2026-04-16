import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MuhasabahJournal } from "./MuhasabahJournal";
import { getBrowserTodayDateKey } from "@/lib/todayDateKey";
import { isLocalSessionCompleteForDate } from "@/lib/muhasabahLocalDraft";

const signIn = vi.fn();
const push = vi.fn();

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

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
  useQuery: () => null,
}));

describe("MuhasabahJournal", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    localStorage.clear();
    signIn.mockReset();
    push.mockReset();
  });

  it("marks the anonymous session complete before starting Google auth", () => {
    render(<MuhasabahJournal variant="anonymous" />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    for (let i = 0; i < 7; i++) {
      fireEvent.click(continueButton);
    }

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(isLocalSessionCompleteForDate(getBrowserTodayDateKey())).toBe(true);
    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/dashboard" });
  });
});
