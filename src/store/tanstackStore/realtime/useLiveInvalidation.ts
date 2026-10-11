/* Live Invalidation */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";

import { accessToken, onTokenChange } from "../services/api/tokens";
import type { Realm } from "../services/api/types";

/**
 * Keeps the cache in step with changes made elsewhere, e.g. a title published
 * in the Studio showing up here (docs/07-state-management.md, section 6).
 *
 * Socket.IO, one namespace per channel. The server sends *what* changed,
 * never the data:
 *   socket.on("invalidate", { entity: ["site", "titles"], id?: "ttl_001" })
 * and we invalidate `entity` as a prefix, so list, detail and search keys all
 * refresh. `id` is for logs only: detail keys are ["site","titles","detail",id],
 * so appending the id would match nothing. Only queries on screen refetch.
 *
 * Off until VITE_REALTIME_URL (the API origin) is set, and socket.io-client
 * only loads then. "public" carries the Studio's edits to anyone; "member"
 * carries ["member", …] keys (e.g. entitlements after a PesaPal IPN), sends
 * the member token in the handshake and reconnects when it changes.
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
    if (!base) return;

    let socket: Socket | null = null;
    let stopped = false;
    const invalidateRoots = () => ALLOWED_ROOTS[channel].forEach((root) => queryClient.invalidateQueries({ queryKey: [root] }));

    import("socket.io-client").then(({ io }) => {
      if (stopped) return;
      socket = io(`${base.replace(/\/$/, "")}/${channel}`, {
        // Re-read on every (re)connect, so a refreshed token is always the one sent.
        auth: (cb) => cb(channel === "public" ? {} : { token: accessToken(channel) }),
        reconnectionDelayMax: MAX_BACKOFF,
        autoConnect: false,
      });

      let connectedBefore = false;
      socket.on("connect", () => {
        // Anything missed while disconnected: refresh the channel's roots.
        if (connectedBefore) invalidateRoots();
        connectedBefore = true;
      });

      socket.on("invalidate", (data: unknown) => {
        const event = parse(data);
        // A channel may only touch its own roots.
        if (!event || !ALLOWED_ROOTS[channel].includes(event.entity[0])) return;
        queryClient.invalidateQueries({ queryKey: event.entity });
      });

      // Signed out: nothing to listen for on a private channel.
      if (channel === "public" || accessToken(channel)) socket.connect();
    });

    // A new sign-in opens the channel (with the new token); a sign-out closes it.
    const off =
      channel === "public"
        ? () => {}
        : onTokenChange((realm, token) => {
            if (realm !== channel || !socket) return;
            socket.disconnect();
            if (token) socket.connect();
          });

    return () => {
      stopped = true;
      off();
      socket?.disconnect();
    };
  }, [channel, queryClient]);
}

function parse(data: unknown): LiveEvent | null {
  const event = (typeof data === "string" ? safeJson(data) : data) as Partial<LiveEvent> | null;
  if (!event || !Array.isArray(event.entity) || !event.entity.length || !event.entity.every((p) => typeof p === "string")) return null;
  return { entity: event.entity, id: typeof event.id === "string" ? event.id : undefined };
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
