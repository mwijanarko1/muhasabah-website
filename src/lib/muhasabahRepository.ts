import {
  FieldValue,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "./firebase/admin";
import type { MuhasabahEntry, MuhasabahEntryInput, UserSettings } from "./muhasabahTypes";

function userDoc(db: Firestore, uid: string) {
  return db.collection("users").doc(uid);
}

function entriesCollection(db: Firestore, uid: string) {
  return userDoc(db, uid).collection("muhasabahEntries");
}

function completionsCollection(db: Firestore, uid: string) {
  return userDoc(db, uid).collection("sessionCompletions");
}

function entryFromSnapshot(snapshot: DocumentSnapshot<DocumentData>): MuhasabahEntry {
  const data = snapshot.data() ?? {};
  return {
    dateKey: String(data.dateKey ?? snapshot.id),
    prayers: data.prayers,
    prayerNotYetTime: data.prayerNotYetTime,
    dhikrQuran: data.dhikrQuran,
    ibadat: data.ibadat,
    kindness: data.kindness,
    learning: data.learning,
    tongueDistractions: data.tongueDistractions,
    heart: data.heart,
    notes: data.notes,
    updatedAt: Number(data.updatedAt ?? 0),
  };
}

function omitUndefinedValues<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue !== undefined) {
      data[key] = entryValue;
    }
  }
  return data;
}

export async function getDay(uid: string, dateKey: string): Promise<MuhasabahEntry | null> {
  const snapshot = await entriesCollection(getFirebaseAdminDb(), uid).doc(dateKey).get();
  if (!snapshot.exists) return null;
  return entryFromSnapshot(snapshot);
}

export async function listRecent(uid: string, limit: number): Promise<MuhasabahEntry[]> {
  const snapshot = await entriesCollection(getFirebaseAdminDb(), uid)
    .orderBy("dateKey", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => entryFromSnapshot(doc));
}

export async function upsertDay(uid: string, entry: MuhasabahEntryInput): Promise<string> {
  const now = Date.now();
  await entriesCollection(getFirebaseAdminDb(), uid)
    .doc(entry.dateKey)
    .set(omitUndefinedValues({ ...entry, updatedAt: now }), { merge: true });
  return entry.dateKey;
}

export async function hasCompletedSessionForDate(
  uid: string,
  dateKey: string,
): Promise<boolean> {
  const snapshot = await completionsCollection(getFirebaseAdminDb(), uid).doc(dateKey).get();
  return snapshot.exists;
}

export async function markSessionComplete(uid: string, dateKey: string): Promise<string> {
  await completionsCollection(getFirebaseAdminDb(), uid)
    .doc(dateKey)
    .set({ dateKey, completedAt: Date.now() }, { merge: true });
  return dateKey;
}

export async function getUserSettings(uid: string): Promise<UserSettings | null> {
  const snapshot = await userDoc(getFirebaseAdminDb(), uid)
    .collection("settings")
    .doc("profile")
    .get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() ?? {};
  return {
    ianaTimezone: String(data.ianaTimezone ?? ""),
    updatedAt: Number(data.updatedAt ?? 0),
  };
}

export async function upsertUserSettings(uid: string, ianaTimezone: string): Promise<UserSettings> {
  const now = Date.now();
  await userDoc(getFirebaseAdminDb(), uid)
    .collection("settings")
    .doc("profile")
    .set(
      {
        ianaTimezone,
        updatedAt: now,
        touchedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  return { ianaTimezone, updatedAt: now };
}
