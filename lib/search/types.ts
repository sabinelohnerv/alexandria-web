/* eslint-disable @typescript-eslint/no-explicit-any */
export type Role = "user" | "assistant" | "system";

export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
}

export interface ChatMessage {
    id: number;
    session: number;
    role: Role;
    text: string;
    answer_json?: any | null;
    latency_ms?: number | null;
    created_at: string;
}

export interface SearchHit {
    id: number;
    message: number;
    document_id: number;
    chunk_id: number;
    rank: number;
    score_vector: number;
    score_lexical?: number | null;
    score_rerank?: number | null;
    meta_json?: any | null;
    created_at: string;
}

export interface AskRequest { session_id?: number; query: string; }
export interface AskResponse { message: ChatMessage; hits: SearchHit[]; }

export interface FeedbackPayload {
    message?: number;
    hit?: number;
    label: "useful" | "not_useful";
    comment?: string;
}

export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
