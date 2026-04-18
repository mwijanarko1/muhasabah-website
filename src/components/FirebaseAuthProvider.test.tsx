import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseAuthProvider, useFirebaseAuth } from "./FirebaseAuthProvider";

const POST_AUTH_REDIRECT_KEY = "muhasabah:postAuthRedirect";

const mocks = vi.hoisted(() => ({
  authStateCallback: null as null | ((user: unknown) => void | Promise<void>),
  getRedirectResult: vi.fn(),
  initializeFirebaseAnalytics: vi.fn().mockResolvedValue(null),
  replace: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

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
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/lib/firebase/client", () => ({
  firebaseAuth: {},
  initializeFirebaseAnalytics: mocks.initializeFirebaseAnalytics,
}));

vi.mock("firebase/auth", () => ({
  getRedirectResult: mocks.getRedirectResult,
  GoogleAuthProvider: class {
    setCustomParameters = vi.fn();
  },
  onIdTokenChanged: vi.fn((_auth, callback) => {
    mocks.authStateCallback = callback;
    return vi.fn();
  }),
  signInWithPopup: mocks.signInWithPopup,
  signInWithRedirect: mocks.signInWithRedirect,
  signOut: mocks.signOut,
}));

function AuthStateLabel() {
  const { authError, isAuthenticated, isLoading, signInWithGoogle } = useFirebaseAuth();
  if (isLoading) return <div>loading</div>;
  return (
    <div>
      <span>{isAuthenticated ? "authenticated" : "anonymous"}</span>
      {authError && <p>{authError}</p>}
      <button type="button" onClick={() => void signInWithGoogle("/dashboard").catch(() => undefined)}>
        Sign in
      </button>
    </div>
  );
}

describe("FirebaseAuthProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("sessionStorage", createMemoryStorage());
    window.sessionStorage.clear();
    window.localStorage.clear();
    mocks.authStateCallback = null;
    mocks.getRedirectResult.mockReset();
    mocks.getRedirectResult.mockResolvedValue(null);
    mocks.initializeFirebaseAnalytics.mockReset();
    mocks.initializeFirebaseAnalytics.mockResolvedValue(null);
    mocks.replace.mockReset();
    mocks.signInWithPopup.mockReset();
    mocks.signInWithRedirect.mockReset();
    mocks.signOut.mockReset();
  });

  it("opens the stored dashboard destination after Firebase resolves a Google redirect sign-in", async () => {
    const firebaseUser = {
      getIdToken: vi.fn().mockResolvedValue("firebase-id-token"),
    };

    window.sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, "/dashboard");
    mocks.getRedirectResult.mockImplementation(async () => {
      await mocks.authStateCallback?.(firebaseUser);
      return { user: firebaseUser };
    });

    render(
      <FirebaseAuthProvider>
        <div>App</div>
      </FirebaseAuthProvider>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    });

    expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)).toBeNull();
  });

  it("does not initialize non-essential Firebase Analytics before consent", async () => {
    render(
      <FirebaseAuthProvider>
        <div>App</div>
      </FirebaseAuthProvider>,
    );

    await act(async () => {
      await mocks.authStateCallback?.(null);
    });

    expect(mocks.initializeFirebaseAnalytics).not.toHaveBeenCalled();
  });

  it("falls back to the locally stored dashboard destination after redirect sign-in", async () => {
    const firebaseUser = {
      getIdToken: vi.fn().mockResolvedValue("firebase-id-token"),
    };

    window.localStorage.setItem(POST_AUTH_REDIRECT_KEY, "/dashboard");
    mocks.getRedirectResult.mockImplementation(async () => {
      await mocks.authStateCallback?.(firebaseUser);
      return { user: firebaseUser };
    });

    render(
      <FirebaseAuthProvider>
        <div>App</div>
      </FirebaseAuthProvider>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    });

    expect(window.localStorage.getItem(POST_AUTH_REDIRECT_KEY)).toBeNull();
  });

  it("does not expose an anonymous state before the redirect result finishes resolving", async () => {
    window.localStorage.setItem(POST_AUTH_REDIRECT_KEY, "/dashboard");
    mocks.getRedirectResult.mockReturnValue(new Promise(() => {}));

    render(
      <FirebaseAuthProvider>
        <AuthStateLabel />
      </FirebaseAuthProvider>,
    );

    await act(async () => {
      await mocks.authStateCallback?.(null);
    });

    expect(document.body).toHaveTextContent("loading");
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(POST_AUTH_REDIRECT_KEY)).toBe("/dashboard");
  });

  it("uses a popup for Google sign-in instead of bouncing through a redirect", async () => {
    const firebaseUser = {
      getIdToken: vi.fn().mockResolvedValue("firebase-id-token"),
    };
    mocks.signInWithPopup.mockImplementation(async () => {
      await mocks.authStateCallback?.(firebaseUser);
      return { user: firebaseUser };
    });

    render(
      <FirebaseAuthProvider>
        <AuthStateLabel />
      </FirebaseAuthProvider>,
    );

    await act(async () => {
      await mocks.authStateCallback?.(null);
    });

    const button = document.querySelector("button");
    if (!button) throw new Error("Sign-in button not found");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mocks.signInWithPopup).toHaveBeenCalledTimes(1);
    });
    expect(mocks.signInWithRedirect).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("surfaces immediate Firebase popup sign-in errors", async () => {
    mocks.signInWithPopup.mockRejectedValue({
      code: "auth/unauthorized-domain",
      message: "This domain is not authorized for OAuth operations.",
    });

    render(
      <FirebaseAuthProvider>
        <AuthStateLabel />
      </FirebaseAuthProvider>,
    );

    await act(async () => {
      await mocks.authStateCallback?.(null);
    });

    const button = document.querySelector("button");
    if (!button) throw new Error("Sign-in button not found");
    fireEvent.click(button);

    await waitFor(() => {
      expect(document.body).toHaveTextContent("auth/unauthorized-domain");
    });
  });

  it("surfaces Firebase redirect result errors after returning from Google", async () => {
    window.localStorage.setItem(POST_AUTH_REDIRECT_KEY, "/dashboard");
    mocks.getRedirectResult.mockRejectedValue({
      code: "auth/unauthorized-domain",
      message: "This domain is not authorized for OAuth operations.",
    });

    render(
      <FirebaseAuthProvider>
        <AuthStateLabel />
      </FirebaseAuthProvider>,
    );

    await waitFor(() => {
      expect(document.body).toHaveTextContent("auth/unauthorized-domain");
    });
  });
});
