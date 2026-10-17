import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  ensureUserProfile,
  logOut as signOutUser,
  updateProfileData,
} from "../services/authService";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const hadUserRef = useRef(false);
  const manualLogoutRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          if (hadUserRef.current && !manualLogoutRef.current) {
            setSessionExpired(true);
          }
          manualLogoutRef.current = false;
          setProfile(null);
          setLoading(false);
          return;
        }

        hadUserRef.current = true;
        setSessionExpired(false);

        try {
          const profileData = await ensureUserProfile(firebaseUser);
          setProfile(profileData);
        } catch (error) {
          console.error("[RedSpend] Failed to load user profile:", error);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("[RedSpend] Auth state listener error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const updateUserProfile = useCallback(
    async (updates) => {
      if (!user) {
        throw new Error("You need to be signed in.");
      }
      const applied = await updateProfileData(user, updates);
      setProfile((current) => ({ ...current, ...applied }));
      return applied;
    },
    [user]
  );

  const logOut = useCallback(async () => {
    manualLogoutRef.current = true;
    try {
      await signOutUser();
    } catch (error) {
      manualLogoutRef.current = false;
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, sessionExpired, updateUserProfile, logOut }),
    [user, profile, loading, sessionExpired, updateUserProfile, logOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
