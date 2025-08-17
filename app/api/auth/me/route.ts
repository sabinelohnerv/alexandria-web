/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from "@/lib/auth/cookies";
import type { User } from "@/lib/auth/types";

export async function GET(req: NextRequest) {
    let access = req.cookies.get(ACCESS_COOKIE)?.value || null;
    const refresh = req.cookies.get(REFRESH_COOKIE)?.value || null;

    // Si no hay access pero sí refresh, renueva
    let setNewAccess: string | null = null;
    if (!access && refresh) {
        try {
            const { access: newAccess, access_token } = await serverFetch<any>("auth/jwt/refresh/", {
                method: "POST",
                body: JSON.stringify({ refresh }),
            });
            access = newAccess ?? access_token ?? null;
            if (access) setNewAccess = access;
        } catch {
            return NextResponse.json({ detail: "Sesión expirada." }, { status: 401 });
        }
    }

    if (!access) {
        return NextResponse.json({ detail: "Sin sesión." }, { status: 401 });
    }

    try {
        const user = await serverFetch<User>("auth/me/", {
            headers: { Authorization: `Bearer ${access}` },
        });

        const res = NextResponse.json({ user });

        // Si se generó un access nuevo, actualízalo en cookie
        if (setNewAccess) {
            res.cookies.set(ACCESS_COOKIE, setNewAccess, { ...cookieOpts });
        }
        return res;
    } catch {
        return NextResponse.json({ detail: "Sesión expirada." }, { status: 401 });
    }
}
