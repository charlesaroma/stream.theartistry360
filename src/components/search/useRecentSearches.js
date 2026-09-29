import { useCallback, useState } from "react";

const KEY = "a360s:recent-searches";
const MAX = 5;

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** The last few searches, newest first, kept in this browser only. */
export function useRecentSearches() {
  const [recent, setRecent] = useState(read);
  // Written straight to storage, not inside a state update: the dialog often
  // closes (and unmounts) in the same tick, and the update would never run.
  const remember = useCallback((q) => {
    const term = q.trim();
    if (term.length < 2) return;
    const next = [term, ...read().filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setRecent(next);
  }, []);
  const clear = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);
  return { recent, remember, clear };
}
