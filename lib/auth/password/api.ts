// lib/auth/password/api.ts
import type {
    PasswordRequestReset,
    PasswordResendReset,
    PasswordConfirmReset,
    PasswordResetStatus,
} from "./types";

async function resJson<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let msg = res.statusText;
        try {
            const j = await res.json();
            msg =
                j?.detail ??
                (Object.keys(j || {})[0] && Array.isArray(j[Object.keys(j)[0]])
                    ? j[Object.keys(j)[0]][0]
                    : msg);
        } catch {
            /* ignore */
        }
        throw new Error(msg || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function requestPasswordReset(body: PasswordRequestReset) {
    const res = await fetch("/api/auth/password/request-reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return resJson<{ detail: string }>(res);
}

export async function resendPasswordReset(body: PasswordResendReset) {
    const res = await fetch("/api/auth/password/resend-reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return resJson<{ detail: string }>(res);
}

export async function confirmPasswordReset(body: PasswordConfirmReset) {
    // body: { email, otp_code, new_password }
    const res = await fetch("/api/auth/password/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return resJson<{ detail: string }>(res);
}

export async function passwordResetStatus(email: string) {
    const res = await fetch(
        `/api/auth/password/status?email=${encodeURIComponent(email)}`,
        { method: "GET", credentials: "include" }
    );
    return resJson<PasswordResetStatus>(res);
}
