/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Todas las llamadas pasan por el proxy Next: /api/backend/...
const BACKEND_PREFIX = "/api/backend/";

function buildUrl(path: string) {
    const clean = path.replace(/^\/+/, "");
    return `${BACKEND_PREFIX}${clean}`;
}

export async function postJson<T = unknown>(path: string, body?: any): Promise<T> {
    const res = await fetch(buildUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}

export async function delJson<T = unknown>(path: string): Promise<T> {
    const res = await fetch(buildUrl(path), { method: "DELETE", credentials: "include" });
    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}
