"use client";

import * as React from "react";

/**
 * Placeholder de modal para calificar “hits” de un mensaje.
 * Integra aquí tu lógica real (fetch de hits, rating por hit, etc).
 */
type Props = {
    open: boolean;
    onClose: () => void;
    messageId: number;
    sessionId?: number;
};

export default function FeedbackHitsDialog({ open, onClose, messageId, sessionId }: Props) {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] grid place-items-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Card */}
            <div
                className="relative z-[101] w-full max-w-2xl rounded-2xl bg-white shadow-lg border p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">Calificar resultados</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-sm border hover:bg-slate-50"
                        aria-label="Cerrar"
                    >
                        Cerrar
                    </button>
                </div>

                <p className="text-sm text-slate-600 mt-1">
                    Placeholder del popup. Aquí mostraremos los <strong>hits</strong> del mensaje{" "}
                    <code>{messageId}</code> {sessionId ? <>de la sesión <code>#{sessionId}</code></> : null}.
                </p>

                {/* Zona de contenido (lista de hits, puntuar cada uno, comentarios, etc.) */}
                <div className="mt-4 space-y-3">
                    <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium">Hit #1 (placeholder)</div>
                        <div className="text-sm text-slate-600">
                            Aquí irá el resumen del documento o el fragmento citado.
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button className="text-xs rounded border px-2 py-1 hover:bg-slate-50">👍 Relevante</button>
                            <button className="text-xs rounded border px-2 py-1 hover:bg-slate-50">👎 No relevante</button>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium">Hit #2 (placeholder)</div>
                        <div className="text-sm text-slate-600">
                            Otro fragmento, con sus metadatos y enlace.
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button className="text-xs rounded border px-2 py-1 hover:bg-slate-50">👍 Relevante</button>
                            <button className="text-xs rounded border px-2 py-1 hover:bg-slate-50">👎 No relevante</button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="rounded-md px-3 py-1.5 text-sm border hover:bg-slate-50"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        className="rounded-md px-3 py-1.5 text-sm text-white"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                        onClick={onClose}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
