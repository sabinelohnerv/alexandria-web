"use client";
import React from "react";

type Props = React.PropsWithChildren<{
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    ariaLabel: string;
}>;

export default function BarButton({ onClick, active, disabled, icon, ariaLabel, children }: Props) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClick}
            disabled={disabled}
            className={[
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px]",
                active
                    ? "border-[color:var(--brand,#023f66)]/50 text-[color:var(--brand,#023f66)] bg-[color:var(--brand,#023f66)]/10"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                "disabled:opacity-50 disabled:pointer-events-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
            ].join(" ")}
        >
            {icon}
            <span>{children}</span>
        </button>
    );
}
