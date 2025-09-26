"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type ModalProps = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** Si es true, clic en overlay NO cierra */
    disableOverlayClose?: boolean;
    /** Marca visual de peligro (rojo en header/cta) */
    danger?: boolean;
};

export default function Modal({
    open,
    title,
    onClose,
    children,
    footer,
    disableOverlayClose,
    danger,
}: ModalProps) {
    const [mounted, setMounted] = React.useState(false);
    const dialogRef = React.useRef<HTMLDivElement>(null);

    // Montaje en cliente (portal)
    React.useEffect(() => setMounted(true), []);

    // Escape para cerrar
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // focus inicial y bloqueo de scroll
    React.useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const id = requestAnimationFrame(() => dialogRef.current?.focus());
        return () => {
            document.body.style.overflow = prev;
            cancelAnimationFrame(id);
        };
    }, [open]);

    if (!mounted || !open) return null;

    return createPortal(
        <div
            aria-modal="true"
            role="dialog"
            aria-labelledby={title ? "modal-title" : undefined}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => !disableOverlayClose && onClose()}
            />
            {/* Dialog */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative z-[1001] w-[min(92vw,520px)] rounded-2xl bg-white shadow-xl outline-none border"
            >
                {/* Header */}
                {title && (
                    <div
                        className={`px-5 py-3 border-b rounded-t-2xl ${danger ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"
                            }`}
                    >
                        <h2
                            id="modal-title"
                            className={`text-sm font-semibold ${danger ? "text-red-700" : "text-slate-900"
                                }`}
                        >
                            {title}
                        </h2>
                    </div>
                )}

                {/* Body */}
                <div className="px-5 py-4 text-sm">{children}</div>

                {/* Footer */}
                {footer && <div className="px-5 py-3 border-t bg-slate-50 rounded-b-2xl">{footer}</div>}

                {/* Close button (X) */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.18 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" />
                    </svg>
                </button>
            </div>
        </div>,
        document.body
    );
}
