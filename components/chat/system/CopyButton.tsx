"use client";
import React from "react";
import { IconCopy } from "./Icons";

type Props = {
    text: string;
};

export default function CopyButton({ text }: Props) {
    const [copied, setCopied] = React.useState(false);

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            /* noop */
        }
    };

    return (
        <div className="absolute right-4 top-2">
            <button
                type="button"
                aria-label="Copiar mensaje"
                onClick={onCopy}
                className={[
                    "inline-flex items-center gap-1 text-[12.5px]",
                    "opacity-0 pointer-events-none transition-opacity",
                    "group-hover:opacity-100 group-hover:pointer-events-auto",
                    "focus:opacity-100 focus:pointer-events-auto",
                    "text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40 rounded-sm",
                ].join(" ")}
            >
                <IconCopy />
                <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
        </div>
    );
}
