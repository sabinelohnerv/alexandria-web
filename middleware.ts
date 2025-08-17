import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

/** Rutas SIEMPRE públicas (no se chequea auth). */
const PUBLIC_PATHS = [
    /^\/login(\/|$)/,
    /^\/register(\/|$)/,
    /^\/register\/confirm(\/|$)/,
    /^\/api\/auth\/register(\/|$)/,
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /^\/assets\//,
];


const PROTECTED_PATHS = [
    /^\/$/,
    /^\/admin(\/|$)/,
];

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // 1) Allowlist: deja pasar login/registro y estáticos sí o sí
    if (PUBLIC_PATHS.some((re) => re.test(pathname))) {
        return NextResponse.next();
    }

    // 2) Solo si la ruta es realmente protegida, chequea cookies
    const needAuth = PROTECTED_PATHS.some((re) => re.test(pathname));
    if (!needAuth) return NextResponse.next();

    const hasAccess = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
    const hasRefresh = Boolean(req.cookies.get(REFRESH_COOKIE)?.value);

    if (!hasAccess && !hasRefresh) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname + search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};
