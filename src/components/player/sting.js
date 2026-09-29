/* Player Sting Rules */
// Once per title per session, never on a resume, never before an ad (free
// members already wait for it), and never under reduced motion.
const key = (id) => `a360-sting:${id}`;

export function stingDue(titleId, { ads, resumeAt }) {
  if (ads || resumeAt > 5) return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(key(titleId));
  } catch {
    return false;
  }
}

export function markStingSeen(titleId) {
  try {
    sessionStorage.setItem(key(titleId), "1");
  } catch {
    // Storage is off: the sting may play again, which is harmless.
  }
}
