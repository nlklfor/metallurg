import type { Action, NpTrackingData, State } from "@/lib/constants/np";
import { useReducer, useEffect } from "react";

const EDGE_URL = "https://ytynsqcxteyufoynvsir.supabase.co/functions/v1/nova-poshta-track";

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return { status: "loading" };
    case "success":
      return { status: "success", data: action.data };
    case "error":
      return { status: "error", error: action.error };
  }
}

export function useNpTracking(ttn: string | null) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });

  useEffect(() => {
    if (!ttn) return;
    dispatch({ type: "fetch" });

    fetch(EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ttn }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        dispatch({ type: "success", data: json as NpTrackingData });
      })
      .catch((e: Error) => dispatch({ type: "error", error: e.message }));
  }, [ttn]);

  return {
    data: state.status === "success" ? state.data : null,
    isLoading: state.status === "loading",
    error: state.status === "error" ? state.error : null,
  };
}
