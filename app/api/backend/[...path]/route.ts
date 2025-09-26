export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

const API_BASE =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api";

export async function GET(req: NextRequest) { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
export async function PUT(req: NextRequest) { return proxy(req); }
export async function PATCH(req: NextRequest) { return proxy(req); }
export async function DELETE(req: NextRequest) { return proxy(req); }

function stripPrefix(pathname: string) {
    const p1 = "/api/backend/";
    const p2 = "/backend/";
    if (pathname.startsWith(p1)) return pathname.slice(p1.length);
    if (pathname.startsWith(p2)) return pathname.slice(p2.length);
    return pathname.replace(/^\/+/, "");
}

async function proxy(req: NextRequest) {
    const access = (await cookies()).get(ACCESS_COOKIE)?.value ?? "";
    const url = new URL(req.url);

    let relative = stripPrefix(url.pathname);
    const last = relative.split("/").pop() || "";
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

    if ((isMutation || relative.startsWith("search/")) &&
        !relative.endsWith("/") &&
        !last.includes(".")) {
        relative += "/";
    }

    const target = `${API_BASE}/${relative}${url.search}`;
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const body = hasBody ? await req.text() : undefined;

    const res = await fetch(target, {
        method: req.method,
        headers: {
            "Content-Type": req.headers.get("content-type") || "application/json",
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body,
        redirect: "follow",
    });

    // 204/304 no llevan body ni ciertos headers
    const noBodyStatus = res.status === 204 || res.status === 304;
    if (noBodyStatus) {
        const headers = new Headers(res.headers);
        headers.delete("content-type");
        headers.delete("content-length");
        return new NextResponse(null, { status: res.status, headers });
    }

    const text = await res.text();
    return new NextResponse(text, {
        status: res.status,
        headers: {
            "content-type": res.headers.get("content-type") || "application/json",
        },
    });
}
