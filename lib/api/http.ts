import { BackendError, type BackendErrorResponse } from "./errors";

const USE_PROXY = true;

const API_BASE_PUBLIC =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_BASE_SERVER =
    process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

function isServer() { return typeof window === "undefined"; }

function normalizePath(path: string, method?: string) {
    const m = (method ?? "GET").toUpperCase();
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(m);

    const qPos = path.indexOf("?");
    const base = qPos >= 0 ? path.slice(0, qPos) : path;
    const query = qPos >= 0 ? path.slice(qPos) : "";

    let cleanBase = base.replace(/^\/+/, "");
    const last = cleanBase.split("/").pop() || "";

    // Añade "/" si es mutación O si la ruta empieza con "search/"
    const needsSlash =
        (isMutation || cleanBase.startsWith("search/")) &&
        !cleanBase.endsWith("/") &&
        !last.includes(".");

    if (needsSlash) cleanBase += "/";

    return `${cleanBase}${query}`;
}

function buildUrl(path: string, method?: string) {
    const safePath = normalizePath(path, method);
    if (USE_PROXY && !isServer()) return `/api/backend/${safePath}`;
    const base = isServer() ? API_BASE_SERVER : API_BASE_PUBLIC;
    return `${base}/${safePath}`;
}

export async function fetchJson<T>(
    path: string,
    init?: RequestInit & { parseAs?: "json" | "text" }
): Promise<T> {
    const res = await fetch(buildUrl(path, init?.method), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    if (!res.ok) {
        // Intentar parsear el error estructurado del backend
        try {
            const errorData = await res.json() as BackendErrorResponse;
            const detail = errorData.detail || res.statusText;
            let code = errorData.code;
            
            // Detectar validaciones de contenido (no son errores técnicos)
            if (!code && res.status === 400 && detail.includes("consultas jurídicas")) {
                code = "content_validation";
            }
            
            throw new BackendError(res.status, detail, code);
        } catch (parseError) {
            // Si no se puede parsear como JSON, usar el texto plano
            if (parseError instanceof BackendError) {
                throw parseError;
            }
            const msg = await res.text().catch(() => res.statusText);
            throw new BackendError(res.status, msg);
        }
    }

    const mode = init?.parseAs ?? "json";
    return (mode === "json" ? res.json() : res.text()) as Promise<T>;
}
