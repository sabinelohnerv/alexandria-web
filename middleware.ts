import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    const hasAccess = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
    const hasRefresh = Boolean(req.cookies.get(REFRESH_COOKIE)?.value);
    if (!hasAccess && !hasRefresh) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", pathname + search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

/**
 * Matcher AMPLIO:
 * - Incluye TODAS las rutas de la app
 * - EXCLUYE: /login, /api, /_next, favicon/robots/sitemap/manifest,
 *   y archivos estáticos comunes (imágenes, fuentes, css/js/map/txt/xml)
 * - Si tienes páginas públicas extra (p.ej. /whitelist-check o /otp),
 *   añádelas al negativo del regex (|whitelist-check|otp)
 */
export const config = {
    matcher: [
        "/((?!_next|api|login|favicon\\.ico|robots\\.txt|sitemap\\.xml|site\\.webmanifest|assets|images|static|public|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map|txt|xml|woff2?|ttf|otf)).*)",
    ],
};
