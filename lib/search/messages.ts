import { fetchJson } from "@/lib/api/http";
import type { ChatMessage } from "./types";

export const listMessages = (sessionId: number, page?: number) =>
  fetchJson<{ count: number; next: string | null; previous: string | null; results: ChatMessage[] }>(
    `search/sessions/${sessionId}/messages/${page ? `?page=${page}` : ""}`
  );

export function getMessage(id: number) {
  return fetchJson<ChatMessage>(`search/messages/${id}/`);
}
