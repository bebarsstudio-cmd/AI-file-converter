import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import type { UserProfile } from "@/types/user";

/** Today's date (UTC) in YYYY-MM-DD format — matches the format stored at signup. */
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Extracts the Firebase error code (e.g. "auth/invalid-credential") if present. */
export function getAuthErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Firestore's "permission-denied" shows up during signup (profile write),
  // so it's mapped here too.
  "permission-denied":
    "Missing or insufficient permissions — check your Firestore security rules.",
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "Your password must be at least 6 characters long.",
  "auth/email-already-in-use":
    "An account with this email already exists. Try signing in instead.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email sign-in is not enabled for this project.",
  "auth/requires-recent-login": "Please sign in again to continue.",
};

/** Turns a Firebase auth error into a message that's safe to show users. */
export function getAuthErrorMessage(error: unknown): string {
  const code = getAuthErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "Something went wrong. Please try again.";
}

/** How long to wait for the profile write during signup before giving up. */
const PROFILE_WRITE_TIMEOUT_MS = 10_000;

/** Rejects with an Error("timeout") if `promise` hasn't settled within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** Creates the Firebase Auth account and the matching Firestore profile document. */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const trimmedName = name.trim();

  if (trimmedName) {
    await updateProfile(user, { displayName: trimmedName });
  }

  // The account is what matters most — if Firestore is unreachable or still
  // being set up, don't strand the user on the signup screen. The profile
  // document is recreated automatically by ensureUserProfile() later.
  try {
    await withTimeout(
      setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: trimmedName,
        email,
        createdAt: new Date().toISOString(),
        conversationCount: 0,
        dailyRequests: 0,
        lastRequestDate: todayISO(),
      }),
      PROFILE_WRITE_TIMEOUT_MS
    );
  } catch (error) {
    // Recoverable: logged as a warning so the dev overlay doesn't flag it as
    // a crash. The profile is recreated by ensureUserProfile() on next login.
    console.warn(
      "Profile document was not saved during signup (is the Firestore database created?). It will be retried on next login.",
      error
    );
  }

  return user;
}

/**
 * Signs in with email/password. When `rememberMe` is true the session is kept
 * across browser restarts (local persistence), otherwise it lasts only for the
 * current tab session.
 */
export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe = true
): Promise<User> {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Sends a password reset email to the given address. */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Creates the user's Firestore profile document if it doesn't exist yet.
 * Keeps sign-in working even when the signup write was interrupted.
 */
export async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    name: user.displayName ?? "",
    email: user.email ?? "",
    createdAt: new Date().toISOString(),
    conversationCount: 0,
    dailyRequests: 0,
    lastRequestDate: todayISO(),
  });
}

/** Live subscription to the user's Firestore profile document. */
export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
    },
    (error) => {
      console.error("Failed to load user profile:", error);
      onData(null);
    }
  );
}
