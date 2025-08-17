import type { RequestOtpRequest, ConfirmOtpRequest, RegisterStatus } from "./types";

function extractErrorMessage(text: string): string {
    try {
        const parsed = JSON.parse(text) as unknown;

        if (typeof parsed === "string") return parsed;

        if (parsed && typeof parsed === "object") {
            const obj = parsed as Record<string, unknown>;

            const d = obj["detail"];
            if (typeof d === "string") return d;

            for (const v of Object.values(obj)) {
                if (typeof v === "string") return v;
                if (Array.isArray(v) && v.length > 0) {
                    const first = v[0];
                    if (typeof first === "string") return first;
                }
            }
        }
    } catch {
    }
    return "";
}

async function resJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        const msg = extractErrorMessage(text) || text || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    // forzamos el tipo genérico
    return (res.json() as unknown) as T;
}

export async function requestRegisterOtp(payload: RequestOtpRequest) {
    const res = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return resJson<{ detail: string }>(res);
}

export async function resendRegisterOtp(email: string) {
    const res = await fetch("/api/auth/register/resend-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return resJson<{ detail: string }>(res);
}

export async function confirmRegisterOtp(payload: ConfirmOtpRequest) {
    const res = await fetch("/api/auth/register/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return resJson<{ detail: string; user: unknown }>(res);
}

export async function getRegisterStatus(email: string) {
    const res = await fetch(`/api/auth/register/status?email=${encodeURIComponent(email)}`, {
        method: "GET",
        credentials: "include",
    });
    return resJson<RegisterStatus>(res);
}
