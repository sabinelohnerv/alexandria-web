/* eslint-disable @typescript-eslint/no-explicit-any */

const BACKEND_PREFIX = "/api/backend/";

function buildUrl(path: string) {
    const clean = path.replace(/^\/+/, "");
    return `${BACKEND_PREFIX}${clean}`;
}

/* ==== Tipos  ==== */
export type DocumentBrief = {
    id: number;
    title: string;
    source_slug: string | null;
    authority: string | null;
    doc_type: string | null;
    number: string | null;
    year: string | null;
    published_date: string | null; // ISO date
    state: string | null;
};

export type ChunkBrief = {
    id: number;
    ordinal: number | null;
    section: string | null;
    block: string | null;
    token_count: number | null;
};

export type SearchHitDTO = {
    id: number;
    rank: number;
    score_vector: number | null;
    score_lexical: number | null;
    score_rerank: number | null;
    meta_json: any | null;
    created_at: string;
    document: DocumentBrief;
    chunk: ChunkBrief;
    snippet?: string | null;
};

type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

type HitsResponse = SearchHitDTO[] | Paginated<SearchHitDTO>;

function isPaginated<T>(x: any): x is Paginated<T> {
    return x && typeof x === "object" && Array.isArray(x.results);
}

export async function fetchMessageHits(
    sessionId: number,
    messageId: number,
    opts?: { includeSnippet?: boolean; limit?: number }
): Promise<SearchHitDTO[]> {
    const qs = new URLSearchParams();
    if (opts?.includeSnippet) qs.set("include_snippet", "1");
    if (opts?.limit) qs.set("limit", String(opts.limit));

    const url = buildUrl(
        `search/sessions/${sessionId}/messages/${messageId}/hits/${qs.toString() ? `?${qs}` : ""}`
    );

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    const data: HitsResponse = await res.json();
    return isPaginated<SearchHitDTO>(data) ? data.results : data;
}


export function getHitFileUrl(sessionId: number, messageId: number, hitId: number) {
    const clean = `search/sessions/${sessionId}/messages/${messageId}/hits/${hitId}/file/`;
    return `${BACKEND_PREFIX}${clean}`;
}

export function openHitFileNewTab(sessionId: number, messageId: number, hitId: number) {
    const url = getHitFileUrl(sessionId, messageId, hitId);
    window.open(url, "_blank", "noopener,noreferrer");
}