/* Google IMA */
// The ad SDK the player asks for a pre-roll with (Studio › Streaming › Ads,
// the web ad tag). Loaded on the first ad only. An ad blocker or a failed
// load is the same as no ad: the title plays.
let loading = null;

export function loadIma() {
  if (window.google?.ima) return Promise.resolve(window.google.ima);
  loading ??= new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
    tag.async = true;
    tag.onload = () => (window.google?.ima ? resolve(window.google.ima) : reject(new Error("The ad SDK didn't load.")));
    tag.onerror = () => {
      loading = null;
      tag.remove();
      reject(new Error("The ad SDK was blocked."));
    };
    document.head.appendChild(tag);
  });
  return loading;
}

/* Frequency cap: when this browser last saw ads, kept for an hour. */
const KEY = "a360s:ads-seen";
const HOUR = 3600_000;

const seen = () => {
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? "[]") ?? []).filter((t) => Date.now() - t < HOUR);
  } catch {
    return [];
  }
};

/** Whether another ad would go over the hourly cap (0: no cap). */
export const capped = (perHour) => perHour > 0 && seen().length >= perHour;

export function recordAd() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen(), Date.now()]));
  } catch {
    // Storage blocked: no cap this visit.
  }
}
