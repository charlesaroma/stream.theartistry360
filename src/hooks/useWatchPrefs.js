/* Watch Preferences */
import { useSyncExternalStore } from "react";

// The viewer's player choices (theatre, auto next, auto skip intro), kept in
// this browser only: a convenience, never account data. Storage may be off
// (private mode); then choices last until reload.
const KEY = "a360s:watch-prefs";
// subtitles: start with the first subtitle track on; dataSaver: cap at 480p.
const DEFAULTS = { theater: false, autoNext: true, autoSkip: false, subtitles: false, dataSaver: false };
const listeners = new Set();
let memory = null;

function read() {
  if (memory) return memory;
  try {
    memory = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    memory = { ...DEFAULTS };
  }
  return memory;
}

export function setWatchPref(name, value) {
  memory = { ...read(), [name]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Storage blocked: keep it for this visit.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** { theater, autoNext, autoSkip, subtitles, dataSaver }; change with setWatchPref(name, value). */
export function useWatchPrefs() {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}
