/* eslint-disable @typescript-eslint/no-explicit-any */

const BACKEND_PREFIX = "/api/backend/";

// Cache para evitar llamadas duplicadas
const hitsCache = new Map<string, { data: SearchHitDTO[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const pendingRequests = new Map<string, Promise<SearchHitDTO[]>>();

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

export function normalizeDocType(raw?: string | null) {
    if (!raw) return "";
    const s = String(raw).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function compactHeader(h: SearchHitDTO) {
    const a = h.document?.authority || "";
    const t = normalizeDocType(h.document?.doc_type);
    const n = h.document?.number || "";

    const parts: string[] = [];
    if (a) parts.push(a);
    if (t) parts.push(t);

    const right: string[] = [];
    if (n) right.push(`Nº ${n}`);

    const leftStr = parts.filter(Boolean).join(" · ");
    const rightStr = right.filter(Boolean).join(" ");
    return [leftStr, rightStr].filter(Boolean).join(" · ");
}

export async function fetchMessageHits(
    sessionId: number,
    messageId: number,
    opts?: { includeSnippet?: boolean; limit?: number }
): Promise<SearchHitDTO[]> {
    const qs = new URLSearchParams();
    if (opts?.includeSnippet) qs.set("include_snippet", "1");
    if (opts?.limit) qs.set("limit", String(opts.limit));

    const cacheKey = `${sessionId}:${messageId}:${qs.toString()}`;
    
    // Verificar caché
    const cached = hitsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    // Si ya hay una petición en curso, retornar esa promesa
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
        return pending;
    }

    const url = buildUrl(
        `search/sessions/${sessionId}/messages/${messageId}/hits/${qs.toString() ? `?${qs}` : ""}`
    );

    // Crear la promesa y guardarla
    const fetchPromise = (async () => {
        try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) {
                const msg = await res.text().catch(() => res.statusText);
                throw new Error(`HTTP ${res.status}: ${msg}`);
            }
            const data: HitsResponse = await res.json();
            const results = isPaginated<SearchHitDTO>(data) ? data.results : data;
            
            // Guardar en caché
            hitsCache.set(cacheKey, { data: results, timestamp: Date.now() });
            
            return results;
        } finally {
            // Limpiar la petición pendiente
            pendingRequests.delete(cacheKey);
        }
    })();
    
    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}

export function getHitFileUrl(sessionId: number, messageId: number, hitId: number) {
    const clean = `search/sessions/${sessionId}/messages/${messageId}/hits/${hitId}/file/`;
    return `${BACKEND_PREFIX}${clean}`;
}

export function openHitFileNewTab(sessionId: number, messageId: number, hitId: number) {
    const url = getHitFileUrl(sessionId, messageId, hitId);
    window.open(url, "_blank", "noopener,noreferrer");
}

// Utilidades para gestionar el caché
export function clearHitsCache() {
    hitsCache.clear();
    pendingRequests.clear();
}

export function clearMessageHitsCache(sessionId: number, messageId: number) {
    const keysToDelete: string[] = [];
    for (const key of hitsCache.keys()) {
        if (key.startsWith(`${sessionId}:${messageId}:`)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => hitsCache.delete(key));
}