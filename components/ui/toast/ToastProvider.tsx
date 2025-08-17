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
    /** ms */
    duration?: number;
};

type ToastCtx = {
    show: (t: Omit<ToastItem, "id">) => void;
    success: (msg: string, title?: string) => void;
    error: (msg: string, title?: string) => void;
    info: (msg: string, title?: string) => void;
    close: (id: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timers = useRef<Record<string, any>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => {
            // limpiar timers si desmonta
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
        const id = crypto.randomUUID();
        const duration = t.duration ?? 3500;
        setToasts((list) => [...list, { ...t, id, duration }]);
        timers.current[id] = setTimeout(() => close(id), duration);
    }, [close]);

    const api = useMemo<ToastCtx>(() => ({
        show,
        success: (msg, title) => show({ kind: "success", message: msg, title }),
        error: (msg, title) => show({ kind: "error", message: msg, title }),
        info: (msg, title) => show({ kind: "info", message: msg, title }),
        close,
    }), [show, close]);

    return (
        <Ctx.Provider value={api}>
            {children}

            {/* Importante: NO renderizar portal durante la hidración inicial */}
            {mounted &&
                createPortal(
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
