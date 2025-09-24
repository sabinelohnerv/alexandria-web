/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ApiError, serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from "@/lib/auth/cookies";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
    try {
        const data = await serverFetch<any>("auth/jwt/refresh/", { method: "POST" });
        const access = data.access ?? data.access_token ?? data?.tokens?.access;
        if (!access) return NextResponse.json({ detail: "Refresh OK pero sin access." }, { status: 502 });

        const res = NextResponse.json({ ok: true });
        res.cookies.set(ACCESS_COOKIE, access, { ...cookieOpts });
        return res;
    } catch (e) {
        if (e instanceof ApiError) {
            const res = NextResponse.json(e.json ?? { detail: e.body }, { status: e.status });
            res.cookies.set(ACCESS_COOKIE, "", { ...cookieOpts, maxAge: 0 });
            res.cookies.set(REFRESH_COOKIE, "", { ...cookieOpts, maxAge: 0 });
            return res;
        }
        return NextResponse.json({ detail: "Error inesperado" }, { status: 500 });
    }
}
