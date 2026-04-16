import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadLocalCompletedDateKeys,
  saveDraftForDateKey,
  setLocalSessionCompleteForDate,
  type LocalDraftShape,
} from "./muhasabahLocalDraft";

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

const draft: LocalDraftShape = {
  prayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  dhikrQuran: 0,
  ibadat: 0,
  kindness: 0,
  learning: 0,
  tongueDistractions: 0,
  heart: 0,
  notes: {},
};

describe("loadLocalCompletedDateKeys", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  it("returns only dates explicitly marked complete", () => {
    saveDraftForDateKey("2026-04-13", draft);
    saveDraftForDateKey("2026-04-14", draft);
    setLocalSessionCompleteForDate("2026-04-14");

    expect(loadLocalCompletedDateKeys()).toEqual(["2026-04-14"]);
  });
});
