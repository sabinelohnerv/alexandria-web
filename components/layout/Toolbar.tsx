"use client";

import * as React from "react";
import clsx from "clsx";

type ToolbarVariant = "desktop" | "mobile";

type ToolbarProps = {
    variant?: ToolbarVariant;
    className?: string;
    children: React.ReactNode;
};

function baseRowClasses(variant: ToolbarVariant) {
    return clsx(
        "flex items-center justify-between gap-2 border-b bg-white",
        variant === "desktop" && "px-3 py-3",
        variant === "mobile" && "px-3 py-2"
    );
}

export default function Toolbar({ className, children }: ToolbarProps) {
    return <div className={clsx("w-full", className)}>{children}</div>;
}

type RowProps = {
    variant?: ToolbarVariant;
    className?: string;
    children: React.ReactNode;
};
Toolbar.Row = function Row({ variant = "desktop", className, children }: RowProps) {
    return <div className={clsx(baseRowClasses(variant), className)}>{children}</div>;
};

type TitleProps = React.PropsWithChildren<{ className?: string }>;
Toolbar.Title = function Title({ className, children }: TitleProps) {
    return <h2 className={clsx("font-semibold", className)}>{children}</h2>;
};

Toolbar.Spacer = function Spacer() {
    return <div className="flex-1" />;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
};
Toolbar.Button = function Button({ variant = "primary", className, ...props }: ButtonProps) {
    const base =
        "rounded-md text-sm font-medium transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#023f66]";
    const styles =
        variant === "primary"
            ? "text-white px-3 py-1.5"
            : variant === "secondary"
                ? "border px-3 py-2 hover:bg-slate-50"
                : "px-3 py-2 hover:bg-slate-50";
    const bg =
        variant === "primary"
            ? { background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }
            : undefined;

    return <button {...props} className={clsx(base, styles, className)} style={bg} />;
};

type SearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
    shortcutHint?: string;
};
Toolbar.Search = function Search({ className, shortcutHint = "⌘K", ...props }: SearchProps) {
    return (
        <div className={clsx("relative rounded-md border focus-within:ring-2 focus-within:ring-[var(--brand)] focus-within:ring-offset-2 transition-all", className)}>
            {/* Icono lupa (izquierda) */}
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none"
            >
                <path
                    d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l4.25 4.25a1 1 0 0 0 1.41-1.41L15.5 14Zm-6 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                    fill="currentColor"
                />
            </svg>

            <input
                {...props}
                type="search"
                className={clsx(
                    "w-full rounded-md pl-8 pr-16 py-2 text-sm bg-transparent",
                    "focus:outline-none"
                )}
            />

            {/* Hint de atajo (derecha) */}
            {shortcutHint && (
                <span className="pointer-events-none absolute right-2 top-2.5 text-slate-400 text-xs">
                </span>
            )}
        </div>
    );
};
