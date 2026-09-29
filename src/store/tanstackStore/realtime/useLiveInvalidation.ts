/* Live Invalidation */
import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { accessToken, onTokenChange } from "../services/api/tokens";
import type { Realm } from "../services/api/types";

/**
 * Keeps the cache in step with changes made elsewhere, e.g. a title published
 * in the Studio showing up here (docs/07-state-management.md, section 6).
 *
 * The server sends *what* changed, never the data:
 *   { "entity": ["site", "titles"], "id": "ttl_001" }
 * and we invalidate that key. Only queries on screen refetch; the rest are
 * marked stale and refetch when next used.
 *
 * Off until VITE_REALTIME_URL is set (the backend's WebSocket endpoint).
 * Channels: "public" carries ["site", …] keys (the Studio's edits) to anyone;
 * "member" carries ["member", …] keys (e.g. entitlements after a PesaPal IPN)
 * and requires the member token, sent as the first message because browsers
 * cannot set headers on a WebSocket.
 */

type Channel = "public" | Realm;

interface LiveEvent {
  entity: string[];
  id?: string;
}

const ALLOWED_ROOTS: Record<Channel, readonly string[]> = {
  public: ["site"],
  member: ["site", "member"],
};

const MAX_BACKOFF = 30_000;

export function useLiveInvalidation(channel: Channel) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const base = import.meta.env.VITE_REALTIME_URL as string | undefined;
    if (!base || typeof WebSocket === "undefined") return;

    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;

    const invalidate = (queryKey: QueryKey) => queryClient.invalidateQueries({ queryKey });

    const connect = () => {
      const token = channel === "public" ? null : accessToken(channel);
      if (channel !== "public" && !token) return; // Signed out: nothing to listen for.

      const url = new URL(base);
      url.searchParams.set("channel", channel);
      const current = new WebSocket(url);
      socket = current;

      current.onopen = () => {
        if (token) current.send(JSON.stringify({ type: "auth", token }));
        // Anything missed while disconnected: refresh the channel's roots.
        if (attempts > 0) ALLOWED_ROOTS[channel].forEach((root) => invalidate([root]));
        attempts = 0;
      };

      current.onmessage = (message) => {
        const event = parse(message.data);
        // A channel may only touch its own roots; a public event can never
        // reach Studio data.
        if (!event || !ALLOWED_ROOTS[channel].includes(event.entity[0])) return;
        invalidate(event.id ? [...event.entity, event.id] : event.entity);
      };

      current.onclose = () => {
        if (stopped || socket !== current) return;
        const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** attempts++);
        timer = setTimeout(connect, delay);
      };
    };

    const restart = () => {
      const old = socket;
      socket = null;
      old?.close();
      clearTimeout(timer);
      connect();
    };

    connect();
    // A new sign-in opens the channel; a sign-out closes it.
    const off = channel === "public" ? () => {} : onTokenChange((realm) => realm === channel && restart());

    return () => {
      stopped = true;
      clearTimeout(timer);
      off();
      socket?.close();
    };
  }, [channel, queryClient]);
}

function parse(data: unknown): LiveEvent | null {
  if (typeof data !== "string") return null;
  try {
    const event = JSON.parse(data) as Partial<LiveEvent>;
    if (!Array.isArray(event.entity) || !event.entity.every((part) => typeof part === "string")) return null;
    return { entity: event.entity, id: typeof event.id === "string" ? event.id : undefined };
  } catch {
    return null;
  }
}
