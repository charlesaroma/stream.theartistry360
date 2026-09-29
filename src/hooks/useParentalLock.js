/* Parental Lock */
import { useState } from "react";

import { useAccountSettings } from "@/store/tanstackStore/queries/member";
import { aboveLimit } from "@/utils/ageRatings";

const KEY = "a360s:parental-unlocked"; // titles unlocked with the PIN, this browser session only

const unlockedIds = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/**
 * Whether a title is above the member's parental limit and still locked.
 * `unlock(pin)` checks the PIN and, if right, opens it for this session.
 */
export function useParentalLock(title) {
  const { settings, isLoading, verifyPin } = useAccountSettings();
  const [opened, setOpened] = useState(unlockedIds);
  const limit = settings.parental.maxRating;
  const locked = Boolean(title) && aboveLimit(title.ageRating, limit) && !opened.includes(title.id);

  const unlock = async (pin) => {
    if (!(await verifyPin(pin))) return false;
    const next = [...new Set([...opened, title.id])];
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage off: unlocked until this page closes.
    }
    setOpened(next);
    return true;
  };

  return { locked, checking: isLoading, limit, unlock };
}
