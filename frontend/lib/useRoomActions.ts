"use client";

import api from "@/lib/api";
import { useChatStore } from "@/lib/store";
import type { ChatRoom } from "@/lib/types";

// Optimistic favourite / archive / status / assign actions for a room.
// Shared by the InfoPanel (desktop) and the RoomActions menu (all sizes).
export function useRoomActions(room: ChatRoom | null) {
  const updateRoom = useChatStore((s) => s.updateRoom);

  const toggleFavourite = async () => {
    if (!room) return;
    const next = !room.favourite;
    updateRoom(room.id, { favourite: next });
    try {
      const { data } = await api.post(`/chat/${room.id}/favourite`, {
        roomType: room.type,
      });
      updateRoom(room.id, { favourite: data.favourite });
    } catch {
      updateRoom(room.id, { favourite: !next });
    }
  };

  const toggleArchive = async () => {
    if (!room) return;
    const next = !room.archived;
    updateRoom(room.id, { archived: next });
    try {
      const { data } = await api.post(`/chat/${room.id}/archive`, {
        roomType: room.type,
      });
      updateRoom(room.id, { archived: data.archived });
    } catch {
      updateRoom(room.id, { archived: !next });
    }
  };

  const changeStatus = async (status: ChatRoom["status"]) => {
    if (!room) return;
    const prev = room.status;
    updateRoom(room.id, { status });
    try {
      await api.put(`/chat/${room.id}/status`, { roomType: room.type, status });
    } catch {
      updateRoom(room.id, { status: prev });
    }
  };

  const assign = async (userId: string | null, userName?: string) => {
    if (!room) return;
    const prev = {
      assignedToId: room.assignedToId,
      assignedToName: room.assignedToName,
      status: room.status,
    };
    updateRoom(room.id, {
      assignedToId: userId || undefined,
      assignedToName: userId ? userName : undefined,
      status: userId ? "assigned" : "open",
    });
    try {
      await api.put(`/chat/${room.id}/assign`, {
        roomType: room.type,
        userId,
      });
    } catch {
      updateRoom(room.id, prev);
    }
  };

  return { toggleFavourite, toggleArchive, changeStatus, assign };
}
