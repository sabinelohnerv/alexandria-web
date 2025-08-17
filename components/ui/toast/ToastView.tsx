"use client";

import { useEffect, useState } from "react";
import type { ToastItem } from "./ToastProvider";
import { IconCheckCircle, IconInfo, IconX, IconXCircle } from "@/components/ui/Icons";

export default function ToastView({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const id = setTimeout(() => setVisible(true), 10); // trigger CSS transition
        return () => clearTimeout(id);
    }, []);

    const color =
        toast.kind === "success"
            ? "bg-emerald-50 border-emerald-200"
            : toast.kind === "error"
                ? "bg-red-50 border-red-200"
                : "bg-sky-50 border-sky-200";

    const icon =
        toast.kind === "success" ? (
            <IconCheckCircle className="text-emerald-600" />
        ) : toast.kind === "error" ? (
            <IconXCircle className="text-red-600" />
        ) : (
            <IconInfo className="text-sky-600" />
        );

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-md transition
        ${color} ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            role="status"
        >
            <div className="mt-[2px]">{icon}</div>
            <div className="min-w-0 flex-1">
                {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
                {toast.message && <div className="text-sm text-slate-700">{toast.message}</div>}
            </div>
            <button
                type="button"
                aria-label="Cerrar notificación"
                className="rounded p-1 text-slate-500 hover:bg-white/60"
                onClick={onClose}
            >
                <IconX />
            </button>
        </div>
    );
}
