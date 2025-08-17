import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/lib/server/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
    const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!refresh) {
        return NextResponse.json({ detail: "No refresh token." }, { status: 401 });
    }

    const data = await serverFetch<{ access: string }>("auth/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
    }); // :contentReference[oaicite:4]{index=4}

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, data.access, { ...cookieOpts });
    return res;
}
