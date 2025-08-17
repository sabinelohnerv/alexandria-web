const USE_PROXY = true;

const API_BASE_PUBLIC =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const API_BASE_SERVER =
    process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

function isServer() {
    return typeof window === "undefined";
}

function buildUrl(path: string) {
    const clean = path.replace(/^\/+/, "");
    if (USE_PROXY && !isServer()) return `/_backend/${clean}`;
    const base = isServer() ? API_BASE_SERVER : API_BASE_PUBLIC;
    return `${base}/${clean}`;
}

export async function fetchJson<T>(
    path: string,
    init?: RequestInit & { parseAs?: "json" | "text" }
): Promise<T> {
    const res = await fetch(buildUrl(path), {
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
