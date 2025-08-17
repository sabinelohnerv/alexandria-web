import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server/api";

export async function POST(req: Request) {
    const body = await req.json(); // { email, otp_code, new_password }
    const data = await serverFetch<{ detail: string }>(
        "/auth/password/confirm/",
        { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }
    );
    return NextResponse.json(data, { status: 200 });
}
