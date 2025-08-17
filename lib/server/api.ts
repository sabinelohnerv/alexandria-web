/* eslint-disable @typescript-eslint/no-explicit-any */

export const API_BASE =
    process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

export class ApiError extends Error {
    status: number;
    body: string;
    json?: any;
    constructor(status: number, body: string) {
        super(`HTTP ${status}`);
        this.status = status;
        this.body = body;
        try { this.json = JSON.parse(body); } catch { }
    }
}

export async function serverFetch<T>(
    path: string,
    init?: RequestInit & { parseAs?: "json" | "text" }
): Promise<T> {
    const url = `${API_BASE}/${path.replace(/^\/+/, "")}`;
    const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new ApiError(res.status, text);
    }

    const mode = init?.parseAs ?? "json";
    return (mode === "json" ? res.json() : res.text()) as Promise<T>;
}
