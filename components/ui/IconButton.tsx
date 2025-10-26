"use client";
import * as React from "react";

type Kind = "primary" | "danger" | "ghost" | "blue" | "green";

type Props = {
    title: string;
    label: string;
    onClick: () => void;
    /** primary = botón de marca sólido. blue/green/danger/ghost = texto coloreado sobre fondo blanco */
    kind?: Kind;
    icon: React.ReactNode;
    disabled?: boolean;
};

export default function IconButton({
    title,
    label,
    onClick,
    kind = "primary",
    icon,
    disabled,
}: Props) {
    const base =
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border transition-all duration-150 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed " +
        "hover:scale-105 active:scale-95";

    const cls =
        kind === "danger"
            ? `${base} border-red-200 text-red-700 bg-white hover:bg-red-50 hover:border-red-300 hover:shadow-sm focus-visible:ring-red-500`
            : kind === "ghost"
                ? `${base} border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm focus-visible:ring-slate-500`
                : kind === "blue"
                    ? `${base} border-sky-200 text-sky-700 bg-white hover:bg-sky-50 hover:border-sky-300 hover:shadow-sm focus-visible:ring-sky-500`
                    : kind === "green"
                        ? `${base} border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm focus-visible:ring-emerald-500`
                        : // primary (marca, sólido como antes)
                        `${base} border-sky-200 text-white bg-[--brand] hover:brightness-110 hover:shadow-md focus-visible:ring-[--brand]`;

    return (
        <button
            type="button"
            className={cls}
            onClick={onClick}
            aria-label={label}
            title={title}
            disabled={disabled}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
