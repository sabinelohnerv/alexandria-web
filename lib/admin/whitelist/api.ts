
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Role, WhitelistEntry } from "./types";

type ListOpts = {
    include_inactive?: boolean;   // toggle "Mostrar inactivos" → status=all
    role?: Role;                  // role=admin|user
    search?: string;              // search=...
    ordering?:
    | "first_name" | "-first_name"
    | "last_name" | "-last_name"
    | "email" | "-email"
    | "created_at" | "-created_at"
    | "role" | "-role";
};

export type CreateWhitelistInput = {
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
};

function extractMessage(payload: any, fallback = "Error") {
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;

    // DRF suele usar { detail: "..." }
    if (typeof payload.detail === "string") return payload.detail;

    // Errores por campo: { field: ["msg1", "msg2"] }
    for (const k of Object.keys(payload)) {
        const v = (payload as any)[k];
        if (typeof v === "string") return v;
        if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }

    try {
        return JSON.stringify(payload);
    } catch {
        return fallback;
    }
}

async function resJsonOrThrow<T>(res: Response): Promise<T> {
    if (res.ok) return res.json() as Promise<T>;

    let text = "";
    try {
        text = await res.text();
        const json = text ? JSON.parse(text) : undefined;
        throw new Error(extractMessage(json, text || `HTTP ${res.status}`));
    } catch (e) {
        if (text && !(e instanceof Error)) throw new Error(text);
        throw e;
    }
}


export async function listWhitelist(opts?: ListOpts) {
    const sp = new URLSearchParams();

    if (opts?.include_inactive) sp.set("status", "all");

    if (opts?.role) sp.set("role", opts.role);
    if (opts?.search) sp.set("search", opts.search.trim());
    if (opts?.ordering) sp.set("ordering", opts.ordering);

    const qs = sp.toString();
    const url = `/api/admin/whitelist${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
    }
    return resJsonOrThrow<WhitelistEntry[]>(res);
}

export async function createWhitelist(dto: CreateWhitelistInput): Promise<WhitelistEntry> {
    const res = await fetch(`/api/admin/whitelist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
    }
    return resJsonOrThrow<WhitelistEntry>(res);
}

export async function getWhitelist(id: number): Promise<WhitelistEntry> {
    const res = await fetch(`/api/admin/whitelist/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return resJsonOrThrow<WhitelistEntry>(res);
}

export async function updateWhitelist(id: number, data: Partial<{
    first_name: string; last_name: string; email: string; role: Role;
}>): Promise<WhitelistEntry> {
    const res = await fetch(`/api/admin/whitelist/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return resJsonOrThrow<WhitelistEntry>(res);
}

export async function deactivateWhitelist(id: number) {
    const res = await fetch(`/api/admin/whitelist/${id}/deactivate`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return resJsonOrThrow<{ detail: string }>(res);
}

export async function reactivateWhitelist(id: number) {
    const res = await fetch(`/api/admin/whitelist/${id}/reactivate`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return resJsonOrThrow<{ detail: string }>(res);
}
