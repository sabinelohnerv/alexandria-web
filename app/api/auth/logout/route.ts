export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies"

export async function POST() {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 })
    res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 })
    return res
}
