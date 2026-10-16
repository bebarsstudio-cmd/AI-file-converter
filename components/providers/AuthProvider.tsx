"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  ensureUserProfile,
  signOutUser,
  subscribeToUserProfile,
} from "@/lib/firebase/auth";
import type { UserProfile } from "@/types/user";

interface AuthContextValue {
  /** The Firebase Auth user, or null when signed out. */
  user: User | null;
  /** The matching Firestore profile document, if one exists. */
  profile: UserProfile | null;
  /** True while the initial auth state is still being resolved. */
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<{
    uid: string;
    profile: UserProfile | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Track the Firebase auth state for the lifetime of the app.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Heal a missing profile document (e.g. an interrupted signup).
      if (firebaseUser) {
        ensureUserProfile(firebaseUser).catch((error) =>
          console.warn("Failed to ensure user profile:", error)
        );
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to the user's Firestore profile while signed in.
  useEffect(() => {
    if (!user) return;

    return subscribeToUserProfile(user.uid, (profile) => {
      setProfileData({ uid: user.uid, profile });
    });
  }, [user]);

  // Never let a previous session's profile leak into the next signed-in user.
  const profile =
    user && profileData?.uid === user.uid ? profileData.profile : null;

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signOut }),
    [user, profile, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current user and auth helpers from any client component. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
