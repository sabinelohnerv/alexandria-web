"use client";

import * as React from "react";

export type KebabItem = {
    label: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
};

type Props = {
    items: KebabItem[];
    /** Clase para posicionar el contenedor relativo del menú si lo necesitas */
    className?: string;
    /** Tamaño del botón (px) */
    size?: number;
    /** Tooltip */
    title?: string;
};

export default function KebabMenu({ items, className = "", size = 28, title }: Props) {
    const [open, setOpen] = React.useState(false);
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Cerrar con click fuera
    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Cerrar con Escape
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen((v) => !v);
    };

    const onItemClick = (cb: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(false);
        cb();
    };

    return (
        <div className={`relative ${className}`}>
            <button
                ref={btnRef}
                type="button"
                title={title ?? "Opciones"}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                className="grid place-items-center rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
                style={{ width: size, height: size }}
            >
                {/* Icono tres puntitos */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                </svg>
            </button>

            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    className="absolute right-0 mt-1 w-44 rounded-lg border bg-white shadow-lg overflow-hidden z-10"
                >
                    {items.map((it, i) => (
                        <button
                            key={i}
                            role="menuitem"
                            type="button"
                            disabled={it.disabled}
                            onClick={onItemClick(it.onClick)}
                            className={[
                                "w-full text-left px-3 py-2 text-sm hover:bg-slate-50",
                                it.danger ? "text-red-600 hover:text-red-700" : "text-slate-800",
                                it.disabled ? "opacity-50 cursor-not-allowed hover:bg-white" : "",
                            ].join(" ")}
                        >
                            {it.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
