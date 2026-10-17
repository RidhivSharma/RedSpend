import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { subscribeToBudgets } from "../services/budgetService";
import { monthKey } from "../utils/dateHelpers";

export function useBudgets(month) {
  const { user } = useAuth();
  const uid = user?.uid;
  const activeMonth = month || monthKey(new Date());
  const [state, setState] = useState({
    data: [],
    loading: Boolean(uid),
    error: null,
    month: null,
  });
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!uid) return undefined;

    const unsubscribe = subscribeToBudgets(
      uid,
      activeMonth,
      (budgets) => {
        setState({ data: budgets, loading: false, error: null, month: activeMonth });
      },
      (subscriptionError) => {
        console.error("[RedSpend] Failed to load budgets:", subscriptionError);
        setState((current) => ({
          ...current,
          loading: false,
          error: "Could not load budgets. Check your connection and try again.",
        }));
      }
    );

    return unsubscribe;
  }, [uid, activeMonth, refreshToken]);

  if (!uid) {
    return { data: [], loading: false, error: null, refresh };
  }

  const loading = state.loading || (state.month !== activeMonth && !state.error);
  return { data: state.data, loading, error: state.error, refresh };
}
