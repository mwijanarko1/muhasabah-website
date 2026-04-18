import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_PROJECT_ID = "muhasabah-c2776";
const MISSING_ADMIN_CREDENTIALS_MESSAGE =
  "Firebase Admin is not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.";

type FirebaseAdminCredentials = {
  clientEmail: string;
  privateKey: string;
  projectId: string;
};

function getProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    DEFAULT_PROJECT_ID
  );
}

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, "\n");
}

function parseServiceAccountJson(): FirebaseAdminCredentials | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be a service account object.");
  }

  const serviceAccount = parsed as {
    clientEmail?: unknown;
    client_email?: unknown;
    privateKey?: unknown;
    private_key?: unknown;
    projectId?: unknown;
    project_id?: unknown;
  };
  const clientEmail = serviceAccount.clientEmail ?? serviceAccount.client_email;
  const privateKey = serviceAccount.privateKey ?? serviceAccount.private_key;
  const projectId = serviceAccount.projectId ?? serviceAccount.project_id ?? getProjectId();

  if (typeof clientEmail !== "string" || typeof privateKey !== "string" || typeof projectId !== "string") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, client_email, or private_key.");
  }

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
    projectId,
  };
}

function getSplitCredentials(): FirebaseAdminCredentials | null {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!clientEmail && !privateKey) return null;
  if (!clientEmail || !privateKey) {
    throw new Error(MISSING_ADMIN_CREDENTIALS_MESSAGE);
  }

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
    projectId: getProjectId(),
  };
}

function canUseApplicationDefaultCredentials(): boolean {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT);
}

function getFirebaseAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const credentials = parseServiceAccountJson() ?? getSplitCredentials();

  if (credentials) {
    return initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
    });
  }

  if (!canUseApplicationDefaultCredentials()) {
    throw new Error(MISSING_ADMIN_CREDENTIALS_MESSAGE);
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: getProjectId(),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
