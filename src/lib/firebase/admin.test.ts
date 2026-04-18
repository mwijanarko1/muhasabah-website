import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  applicationDefault: vi.fn(() => ({ type: "application-default" })),
  cert: vi.fn((credential) => ({ credential, type: "cert" })),
  getApps: vi.fn(() => []),
  getAuth: vi.fn((app) => ({ app })),
  getFirestore: vi.fn((app) => ({ app })),
  initializeApp: vi.fn((options) => ({ options })),
}));

vi.mock("firebase-admin/app", () => ({
  applicationDefault: mocks.applicationDefault,
  cert: mocks.cert,
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: mocks.getAuth,
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: mocks.getFirestore,
}));

const ENV_KEYS = [
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GOOGLE_CLOUD_PROJECT",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

async function loadAdmin() {
  vi.resetModules();
  return import("./admin");
}

describe("Firebase Admin initialization", () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
    mocks.applicationDefault.mockClear();
    mocks.cert.mockClear();
    mocks.getApps.mockClear();
    mocks.getApps.mockReturnValue([]);
    mocks.getAuth.mockClear();
    mocks.getFirestore.mockClear();
    mocks.initializeApp.mockClear();
  });

  it("fails explicitly when Firebase Admin service-account credentials are missing", async () => {
    const { getFirebaseAdminAuth } = await loadAdmin();

    expect(() => getFirebaseAdminAuth()).toThrow(
      "Firebase Admin is not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
    expect(mocks.applicationDefault).not.toHaveBeenCalled();
    expect(mocks.initializeApp).not.toHaveBeenCalled();
  });

  it("initializes from a service account JSON environment value", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "firebase-adminsdk@example.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
      project_id: "muhasabah-test",
    });

    const { getFirebaseAdminDb } = await loadAdmin();

    getFirebaseAdminDb();

    expect(mocks.cert).toHaveBeenCalledWith({
      clientEmail: "firebase-adminsdk@example.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
      projectId: "muhasabah-test",
    });
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      credential: { type: "cert", credential: expect.any(Object) },
      projectId: "muhasabah-test",
    });
  });
});
