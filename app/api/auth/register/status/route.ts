/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/server/api";

export async function GET(req: NextRequest) {
    const email = new URL(req.url).searchParams.get("email") || "";
    const res = await fetch(`${API_BASE}/auth/register/status/?email=${encodeURIComponent(email)}`);
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { detail: text || res.statusText }; }
    return NextResponse.json(data, { status: res.status });
}
