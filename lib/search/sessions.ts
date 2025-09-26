import { fetchJson } from "@/lib/api/http";
import type { ChatSession, Paginated } from "./types";

// lib/search/sessions.ts
export const listSessions = () =>
    fetchJson<Paginated<ChatSession>>("search/sessions/");

export const getSession = (id: number) =>
    fetchJson<ChatSession>(`search/sessions/${id}/`);

export const createSession = (title?: string) =>
    fetchJson<ChatSession>("search/sessions/", {
        method: "POST",
        body: JSON.stringify({ title }),
    });

export const renameSession = (id: number, title: string) =>
    fetchJson<ChatSession>(`search/sessions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
    });

export const deleteSession = (id: number) =>
    fetchJson<void>(`search/sessions/${id}/`, {
        method: "DELETE",
        parseAs: "text",
    });

export const restoreSession = (id: number) =>
    fetchJson<ChatSession>(`search/sessions/${id}/restore/`, { method: "POST" });
