/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/search/feedback.ts
import { fetchJson } from "@/lib/api/http";

export type FeedbackLabel = "useful" | "not_useful";

export type FeedbackPost = {
    message?: number;
    hit?: number;           // reservado para feedback por-hit (futuro)
    label: FeedbackLabel;
    comment?: string;
};

/**
 * POST /api/search/feedback/
 * body: { message, label, comment? }
 * resp: { id, message, hit, label, comment, created_at, ... }
 */
export async function postFeedback(body: FeedbackPost) {
    return fetchJson<any>("search/feedback/", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function postHitFeedback(
    messageId: number,
    hitId: number,
    label: FeedbackLabel
) {
    return postFeedback({ message: messageId, hit: hitId, label });
}

export async function deleteHitFeedback(messageId: number, hitId: number) {
    const qs = new URLSearchParams({
        message_id: String(messageId),
        hit_id: String(hitId),
    }).toString();
    return fetchJson<{ deleted: number }>(`search/feedback/?${qs}`, { method: "DELETE" });
}

/**
 * DELETE /api/search/feedback/?message_id=:id
 * resp: { deleted: 1|0 }
 */
export async function deleteFeedbackByMessage(messageId: number) {
    const qs = new URLSearchParams({ message_id: String(messageId) }).toString();
    return fetchJson<{ deleted: number }>(`search/feedback/?${qs}`, {
        method: "DELETE",
    });
}


export async function postSemanticVote(
    sessionId: number,
    messageId: number,
    label: FeedbackLabel
) {
    return fetchJson<any>(`search/sessions/${sessionId}/messages/${messageId}/vote`, {
        method: "POST",
        body: JSON.stringify({ label }),
    });
}

export async function deleteSemanticVote(sessionId: number, messageId: number) {
    return fetchJson<any>(`search/sessions/${sessionId}/messages/${messageId}/unvote`, {
        method: "DELETE",
    });
}
