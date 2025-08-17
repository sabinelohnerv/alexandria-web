// app/api/admin/whitelist/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import type { WhitelistEntry } from "@/lib/admin/whitelist/types";

/** Headers de autorización leídos de la cookie (en route handlers usar await cookies()) */
async function buildAuthHeaders(): Promise<Record<string, string>> {
    const store = await cookies();
    const token = store.get(ACCESS_COOKIE)?.value;
    return token
        ? { Authorization: `Bearer ${token}`, Cookie: `${ACCESS_COOKIE}=${token}` }
        : {};
}

/** GET /api/admin/whitelist/[id] -> proxy a GET /whitelist/{id}/ */
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const headers = await buildAuthHeaders();

    const data = await serverFetch<WhitelistEntry>(`/whitelist/${id}/`, {
        method: "GET",
        headers,
    });

    return NextResponse.json(data);
}

/** PATCH /api/admin/whitelist/[id] -> proxy a PATCH /whitelist/{id}/ */
export async function PATCH(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const headers = await buildAuthHeaders();

    // Lee JSON del request; si no es JSON válido, responde 400 desde el proxy
    let payload: unknown;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
    }

    // IMPORTANTe: serializa a string para satisfacer RequestInit.body (BodyInit)
    const updated = await serverFetch<WhitelistEntry>(`/whitelist/${id}/`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload), // 👈 string, no unknown
    });

    return NextResponse.json(updated);
}
