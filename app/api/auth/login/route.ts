/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/server/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts, refreshMaxAge } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
        return NextResponse.json({ detail: "Email y password requeridos." }, { status: 400 });
    }

    try {
        const payload = { email, username: email, password };

        const data = await serverFetch<any>("auth/jwt/login/", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        const access = data.access ?? data.access_token ?? data?.tokens?.access;
        const refresh = data.refresh ?? data.refresh_token ?? data?.tokens?.refresh;
        const user = data.user ?? data.profile ?? data.data ?? null;

        if (!access || !refresh) {
            return NextResponse.json(
                { detail: "Login OK pero sin tokens en la respuesta del backend." },
                { status: 502 }
            );
        }

        const res = NextResponse.json({ user: user ?? null });

        res.cookies.set(REFRESH_COOKIE, refresh, { ...cookieOpts, maxAge: refreshMaxAge });
        // access sin maxAge (sesión corta), lo renovamos con /refresh
        res.cookies.set(ACCESS_COOKIE, access, { ...cookieOpts });

        return res;
    } catch (e) {
        if (e instanceof ApiError) {
            return NextResponse.json(e.json ?? { detail: e.body }, { status: e.status });
        }
        return NextResponse.json({ detail: "Error inesperado" }, { status: 500 });
    }
}
