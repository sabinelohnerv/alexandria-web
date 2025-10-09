 "use client";

import * as React from "react";

type PdfChipProps = {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
};

/** Ícono simple de documento/PDF */
const PdfIcon = () => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        aria-hidden
        className="shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 14h1.8c.7 0 1.2.5 1.2 1.2v0c0 .7-.5 1.2-1.2 1.2H9V14z" />
        <path d="M14 14h2" />
        <path d="M14 16h1.2" />
    </svg>
);

/** Chip/botón primario “Ver PDF” (menos redondeado, sin sombra) */
export default function PdfChip({
    label = "Ver PDF",
    onClick,
    disabled,
    className,
}: PdfChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={[
                // base
                "inline-flex items-center gap-2 select-none",
                "rounded-md border px-3 py-1.5 text-sm font-medium", // <- menos redondeado
                // look
                "bg-white text-[color:var(--brand,#023f66)]",
                "border-[color:var(--brand,#023f66)]/40", // sin shadow
                // hover/active
                "hover:bg-[color:var(--brand,#023f66)]/5 active:bg-[color:var(--brand,#023f66)]/10",
                // focus
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
                // disabled
                "disabled:opacity-50 disabled:pointer-events-none",
                className || "",
            ].join(" ")}
        >
            <PdfIcon />
            <span>{label}</span>

        </button>
    );
}
