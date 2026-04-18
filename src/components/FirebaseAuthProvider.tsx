"use client";

import {
  GoogleAuthProvider,
  getRedirectResult,
  onIdTokenChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { firebaseAuth } from "@/lib/firebase/client";

const POST_AUTH_REDIRECT_KEY = "muhasabah:postAuthRedirect";

function normalizePostAuthRedirect(redirectTo: string | null): string | null {
  if (!redirectTo) return null;
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) return null;
  return redirectTo;
}

function storePostAuthRedirect(redirectTo: string): void {
  const safeRedirectTo = normalizePostAuthRedirect(redirectTo) ?? "/dashboard";
  window.sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, safeRedirectTo);
  window.localStorage.setItem(POST_AUTH_REDIRECT_KEY, safeRedirectTo);
}

function readPostAuthRedirect(): string | null {
  return (
    normalizePostAuthRedirect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)) ??
    normalizePostAuthRedirect(window.localStorage.getItem(POST_AUTH_REDIRECT_KEY))
  );
}

function clearPostAuthRedirect(): void {
  window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  window.localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
}

type FirebaseAuthContextValue = {
  authError: string | null;
  authToken: string | null;
  getIdToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

function formatFirebaseAuthError(error: unknown): string {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: unknown; message?: unknown };
    const code = typeof maybeError.code === "string" ? maybeError.code : null;
    const message = typeof maybeError.message === "string" ? maybeError.message : null;
    if (code && message) return `${code}: ${message}`;
    if (code) return code;
    if (message) return message;
  }
  return "Google sign-in failed. Please try again.";
}

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let isResolvingStoredRedirect = readPostAuthRedirect() !== null;
    let latestAuthUser: User | null = null;

    async function applyAuthUser(nextUser: User | null, keepLoading = false) {
      const nextAuthToken = nextUser ? await nextUser.getIdToken() : null;
      if (!isActive) return;
      if (nextUser) {
        setAuthError(null);
      }
      setUser(nextUser);
      setAuthToken(nextAuthToken);
      if (!keepLoading) {
        setIsLoading(false);
      }
    }

    const unsubscribe = onIdTokenChanged(firebaseAuth, (nextUser) => {
      latestAuthUser = nextUser;
      if (isResolvingStoredRedirect && !nextUser) {
        void applyAuthUser(nextUser, true);
        return;
      }
      void applyAuthUser(nextUser);
    });

    void getRedirectResult(firebaseAuth)
      .then((result) => {
        isResolvingStoredRedirect = false;
        if (result?.user) {
          void applyAuthUser(result.user);
          return;
        }
        void applyAuthUser(latestAuthUser);
      })
      .catch((error) => {
        isResolvingStoredRedirect = false;
        console.error("Failed to complete Firebase redirect sign-in:", error);
        if (isActive) {
          setAuthError(formatFirebaseAuthError(error));
        }
        void applyAuthUser(latestAuthUser);
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    const redirectTo = readPostAuthRedirect();
    if (!redirectTo) return;
    clearPostAuthRedirect();
    router.replace(redirectTo);
  }, [isLoading, router, user]);

  const getIdToken = useCallback(async () => {
    return firebaseAuth.currentUser?.getIdToken() ?? null;
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo = "/dashboard") => {
    setAuthError(null);
    storePostAuthRedirect(redirectTo);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(firebaseAuth, provider);
      router.replace(normalizePostAuthRedirect(redirectTo) ?? "/dashboard");
    } catch (error) {
      setAuthError(formatFirebaseAuthError(error));
      throw error;
    }
  }, [router]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(firebaseAuth);
  }, []);

  const value = useMemo<FirebaseAuthContextValue>(
    () => ({
      authError,
      authToken,
      getIdToken,
      isAuthenticated: user !== null,
      isLoading,
      signInWithGoogle,
      signOut,
      user,
    }),
    [authError, authToken, getIdToken, isLoading, signInWithGoogle, signOut, user],
  );

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}

export function useFirebaseAuth() {
  const value = useContext(FirebaseAuthContext);
  if (!value) {
    throw new Error("useFirebaseAuth must be used inside FirebaseAuthProvider");
  }
  return value;
}
