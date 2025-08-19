/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ToastView from "./ToastView";

export type ToastKind = "success" | "error" | "info";

export type ToastItem = {
    id: string;
    kind: ToastKind;
    title?: string;
    message?: string;
    duration?: number;
};

type FromErrorOpts = {
    title?: string;
    fallback?: string;
    kind?: ToastKind;
};

type ToastCtx = {
    show: (t: Omit<ToastItem, "id">) => void;
    success: (msg?: string, title?: string) => void;
    error: (msg?: string, title?: string) => void;
    info: (msg?: string, title?: string) => void;
    fromError: (err: unknown, opts?: FromErrorOpts) => void;
    close: (id: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);


function safeParseJsonString(s?: string): unknown | undefined {
    if (!s) return;
    const t = s.trim();
    if (!t.startsWith("{") && !t.startsWith("[")) return;
    try {
        return JSON.parse(t);
    } catch {
        return;
    }
}

function pickMessage(payload: unknown): string | undefined {
    if (!payload) return;
    if (typeof payload === "string") return payload;

    if (typeof payload === "object" && payload !== null) {
        const obj = payload as Record<string, unknown>;

        // DRF: {"detail":"..."}
        if (typeof obj.detail === "string") return obj.detail;

        // DRF: {"field": ["error1", ...]}
        for (const v of Object.values(obj)) {
            if (typeof v === "string") return v;
            if (Array.isArray(v) && typeof v[0] === "string") return v[0] as string;
        }
    }
}

function getToastMessageFromError(err: unknown, fallback = "Ocurrió un error"): string {
    const j = (err as any)?.json ?? (err as any)?.__json;
    const pickedFromJson = pickMessage(j);
    if (pickedFromJson) return pickedFromJson;


    if (err instanceof Error) {
        const parsed = safeParseJsonString(err.message);
        const picked = pickMessage(parsed);
        if (picked) return picked;

        if (err.message) return err.message;
    }
    const pickedDirect = pickMessage(err);
    if (pickedDirect) return pickedDirect;

    return fallback;
}

function normalizePlainMessage(msg: string | undefined, fallback: string) {
    if (!msg) return fallback;
    const parsed = safeParseJsonString(msg);
    const picked = pickMessage(parsed);
    return picked ?? msg;
}

function newId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}


export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef<Record<string, any>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => {
            Object.values(timers.current).forEach(clearTimeout);
            timers.current = {};
        };
    }, []);

    const close = useCallback((id: string) => {
        setToasts((list) => list.filter((t) => t.id !== id));
        const tm = timers.current[id];
        if (tm) {
            clearTimeout(tm);
            delete timers.current[id];
        }
    }, []);

    const show = useCallback<ToastCtx["show"]>((t) => {
        const id = newId();
        const duration = t.duration ?? 3500;
        setToasts((list) => [...list, { ...t, id, duration }]);
        timers.current[id] = setTimeout(() => close(id), duration);
    }, [close]);

    const success = useCallback<ToastCtx["success"]>((msg, title) => {
        show({ kind: "success", message: normalizePlainMessage(msg, "Operación exitosa"), title });
    }, [show]);

    const error = useCallback<ToastCtx["error"]>((msg, title) => {
        show({ kind: "error", message: normalizePlainMessage(msg, "Ocurrió un error"), title });
    }, [show]);

    const info = useCallback<ToastCtx["info"]>((msg, title) => {
        show({ kind: "info", message: normalizePlainMessage(msg, "Información"), title });
    }, [show]);

    const fromError = useCallback<ToastCtx["fromError"]>((err, opts) => {
        const kind = opts?.kind ?? "error";
        const title = opts?.title ?? (kind === "error" ? "Error" : kind === "success" ? "Éxito" : "Aviso");
        const fallback = opts?.fallback ?? (kind === "error" ? "Ocurrió un error" : kind === "success" ? "Operación exitosa" : "Información");
        const msg = getToastMessageFromError(err, fallback);
        show({ kind, title, message: msg });
    }, [show]);

    const api = useMemo<ToastCtx>(() => ({
        show, success, error, info, fromError, close,
    }), [show, success, error, info, fromError, close]);

    return (
        <Ctx.Provider value={api}>
            {children}

            {/* Importante: NO renderizar portal durante la hidración inicial */}
            {mounted && createPortal(
                <div
                    className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[min(420px,92vw)] flex-col gap-2"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {toasts.map((t) => (
                        <ToastView key={t.id} toast={t} onClose={() => close(t.id)} />
                    ))}
                </div>,
                document.body
            )}
        </Ctx.Provider>
    );
}

export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
    return ctx;
}
