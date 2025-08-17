/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/server/api";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/auth/register/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { detail: text || res.statusText }; }
    return NextResponse.json(data, { status: res.status });
}
