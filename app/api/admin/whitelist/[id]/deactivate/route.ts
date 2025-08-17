import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

async function buildAuthHeaders(): Promise<Record<string, string>> {
    const jar = await cookies();
    const token = jar.get(ACCESS_COOKIE)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function POST(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const headers = await buildAuthHeaders();

    const data = await serverFetch(`/whitelist/${id}/deactivate/`, {
        method: "POST",
        headers,
    });

    return NextResponse.json(data ?? { ok: true });
}
