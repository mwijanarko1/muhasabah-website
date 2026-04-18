import type { LocalDraftShape } from "./muhasabahLocalDraft";

export type TransientMuhasabahSession = {
  dateKey: string;
  draft: LocalDraftShape;
};

let transientSession: TransientMuhasabahSession | null = null;
const PENDING_AUTH_SESSION_KEY = "muhasabah-pending-auth-session-v1";

export function setTransientMuhasabahSession(session: TransientMuhasabahSession): void {
  transientSession = session;
}

export function getTransientMuhasabahSession(): TransientMuhasabahSession | null {
  return transientSession;
}

export function clearTransientMuhasabahSession(): void {
  transientSession = null;
}

function parseSession(value: unknown): TransientMuhasabahSession | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<TransientMuhasabahSession>;
  if (typeof candidate.dateKey !== "string") return null;
  if (!candidate.draft || typeof candidate.draft !== "object") return null;
  return {
    dateKey: candidate.dateKey,
    draft: candidate.draft as TransientMuhasabahSession["draft"],
  };
}

export function storePendingAuthMuhasabahSession(session: TransientMuhasabahSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / private mode
  }
}

export function getPendingAuthMuhasabahSession(): TransientMuhasabahSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_AUTH_SESSION_KEY);
    if (!raw) return null;
    return parseSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearPendingAuthMuhasabahSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_AUTH_SESSION_KEY);
  } catch {
    // ignore
  }
}
