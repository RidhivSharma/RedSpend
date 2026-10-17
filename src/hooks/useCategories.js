import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { subscribeToCategories } from "../services/categoryService";

export function useCategories() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!uid) return undefined;

    const unsubscribe = subscribeToCategories(
      uid,
      (categories) => {
        setData(categories);
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        console.error("[RedSpend] Failed to load categories:", subscriptionError);
        setError("Could not load categories. Check your connection and try again.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, refreshToken]);

  if (!uid) {
    return { data: [], loading: false, error: null, refresh };
  }

  return { data, loading, error, refresh };
}
