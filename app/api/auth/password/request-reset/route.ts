import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server/api";

export async function POST(req: Request) {
    const body = await req.json();
    const data = await serverFetch<{ detail: string }>(
        "/auth/password/request-reset/",
        { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }
    );
    return NextResponse.json(data, { status: 200 });
}
