import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import type { WhitelistEntry } from "@/lib/admin/whitelist/types";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

async function buildAuthHeaders(): Promise<Record<string, string>> {
    const jar = await cookies();
    const token = jar.get(ACCESS_COOKIE)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(req: NextRequest) {
    const headers = await buildAuthHeaders();
    const qs = new URL(req.url).search;
    const paged = await serverFetch<Paginated<WhitelistEntry>>(`/whitelist/${qs}`, {
        method: "GET",
        headers,
    });
    return NextResponse.json(paged.results);
}

export async function POST(req: NextRequest) {
    const headers = await buildAuthHeaders();
    const payload = (await req.json()) as {
        first_name: string;
        last_name: string;
        email: string;
        role: "admin" | "user";
    };

    const created = await serverFetch<WhitelistEntry>(`/whitelist/`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    return NextResponse.json(created, { status: 201 });
}
