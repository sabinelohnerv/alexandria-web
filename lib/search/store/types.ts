"use client";

import type { ChatMessage } from "@/lib/search/types";

/* ========= Mensajes ========= */
export type UIMessage = {
    id: number;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
};
export function toUIMessage(m: ChatMessage): UIMessage {
    return { id: m.id, role: m.role, content: m.text, createdAt: m.created_at };
}

/* ========= Sesiones ========= */
export type UISession = {
    id: number;
    title: string;
    updatedAt: string;
    isDeleted?: boolean;
    /** true si solo existe en frontend (no creada aún en backend) */
    isLocal?: boolean;
};

/* ========= Feedback ========= */
export type FeedbackLabel = "useful" | "not_useful";
export type FBCounts = { useful: number; not_useful: number };

/* ========= Estado base ========= */
export type CoreState = {
    sessions: UISession[];
    currentId: number | null;
    messagesBySession: Record<number, UIMessage[]>;
    loadingSessions: boolean;
    loadingMessages: Record<number, boolean>;
    error?: string | null;
    suppressNextDraftDiscard?: boolean;
};

export type FeedbackState = {
    feedbackSubmitting: Record<number, boolean>;
    myFeedback: Record<number, FeedbackLabel | null>;
    feedbackCounts: Record<number, FBCounts>;
};

/* helpers para slices */
export type SetFn<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
export type GetFn<T> = () => T;
