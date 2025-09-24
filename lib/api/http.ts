const USE_PROXY = true;

const API_BASE_PUBLIC =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_BASE_SERVER =
    process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

function isServer() { return typeof window === "undefined"; }

// añade "/" final solo en mutaciones y antes del query
function normalizePath(path: string, method?: string) {
    const m = (method ?? "GET").toUpperCase();
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(m);

    const qPos = path.indexOf("?");
    const base = qPos >= 0 ? path.slice(0, qPos) : path;
    const query = qPos >= 0 ? path.slice(qPos) : "";

    let cleanBase = base.replace(/^\/+/, "");
    if (isMutation && !cleanBase.endsWith("/") && !cleanBase.split("/").pop()?.includes(".")) {
        cleanBase += "/";
    }
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
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${msg}`);
    }

    const mode = init?.parseAs ?? "json";
    return (mode === "json" ? res.json() : res.text()) as Promise<T>;
}
