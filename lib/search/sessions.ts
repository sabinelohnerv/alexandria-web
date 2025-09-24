import { fetchJson } from "@/lib/api/http";
import type { ChatSession, Paginated } from "./types";

export function listSessions(page?: number) {
    const q = page ? `?page=${page}` : "";
    return fetchJson<Paginated<ChatSession>>(`search/sessions/${q}`);
}

export function getSession(id: number) {
    return fetchJson<ChatSession>(`search/sessions/${id}/`);
}

export function createSession(title?: string) {
    return fetchJson<ChatSession>("search/sessions/", {
        method: "POST",
        body: JSON.stringify({ title: title ?? "" }),
    });
}

export function renameSession(id: number, title: string) {
    return fetchJson<ChatSession>(`search/sessions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
    });
}

export function deleteSession(id: number) {
    return fetchJson<void>(`search/sessions/${id}/`, { method: "DELETE" });
}

export function restoreSession(id: number) {
    return fetchJson<ChatSession>(`search/sessions/${id}/restore/`, { method: "POST" });
}
