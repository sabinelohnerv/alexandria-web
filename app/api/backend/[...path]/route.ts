// app/api/backend/[...path]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

const API_BASE =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000/api";


const REWRITE_FROM = process.env.FILE_HOST_REWRITE_FROM;
const REWRITE_TO = process.env.FILE_HOST_REWRITE_TO;
const rewriteLocation = (loc: string) =>
    REWRITE_FROM && REWRITE_TO ? loc.replace(REWRITE_FROM, REWRITE_TO) : loc;

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

    // Añade trailing slash para DRF (mutaciones) y rutas search/*
    if ((isMutation || relative.startsWith("search/")) &&
        !relative.endsWith("/") &&
        !last.includes(".")) {
        relative += "/";
    }

    const target = `${API_BASE}/${relative}${url.search}`;
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const body = hasBody ? await req.text() : undefined;

    // No seguir redirecciones; se devuelven al navegador
    const res = await fetch(target, {
        method: req.method,
        headers: {
            ...(req.headers.get("content-type") ? { "Content-Type": req.headers.get("content-type")! } : {}),
            ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body,
        redirect: "manual",
        // credentials no aplican en fetch del edge/server; cookies ya se adjuntan via header Authorization arriba
    });

    // Manejo explícito de 3xx
    if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (loc) {
            const finalLoc = rewriteLocation(loc);
            return NextResponse.redirect(finalLoc, res.status);
        }
        return new NextResponse(null, { status: res.status, headers: res.headers });
    }

    // 204/304 sin body
    if (res.status === 204 || res.status === 304) {
        const headers = new Headers(res.headers);
        headers.delete("content-length");
        headers.delete("content-type");
        return new NextResponse(null, { status: res.status, headers });
    }

    // Para 200/errores: stream del body tal cual (binario o json) respetando headers
    const headers = new Headers(res.headers);
    return new NextResponse(res.body, {
        status: res.status,
        headers,
    });
}
