"use client";

import React from "react";

type Props = {
    href: string;
    label: string;
    className?: string;
};

export default function SourceChipLink({ href, label, className }: Props) {
    const cleanLabel = React.useMemo(() => label.replace(/`+/g, "").trim(), [label]);

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={cleanLabel}
            title={cleanLabel}
            className={[
                "inline-flex items-center align-middle whitespace-nowrap",
                "rounded-full border px-2.5 py-[3px] text-[12px] leading-none font-semibold",
                "bg-slate-50 border-slate-200 text-slate-700",      // sin shadow
                "hover:bg-slate-100 hover:border-slate-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
                "no-underline transition-colors",
                className || "",
            ].join(" ")}
        >
            {cleanLabel}
        </a>
    );
}
