"use client";

import { useEffect } from "react";

import { io } from "socket.io-client";

export function useRealtimeRoom({
  backendUrl,
  enabled,
  room,
  onMessage,
}: {
  backendUrl: string;
  enabled: boolean;
  onMessage: () => void;
  room: string;
}) {
  useEffect(() => {
    if (!enabled || !backendUrl) {
      return;
    }

    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    const refresh = () => onMessage();

    socket.on("connect", () => {
      socket.emit("join_table", room);
    });

    socket.on("row_inserted", refresh);
    socket.on("row_updated", refresh);
    socket.on("row_deleted", refresh);

    return () => {
      socket.off("row_inserted", refresh);
      socket.off("row_updated", refresh);
      socket.off("row_deleted", refresh);
      socket.disconnect();
    };
  }, [backendUrl, enabled, onMessage, room]);
}

