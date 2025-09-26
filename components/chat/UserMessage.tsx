"use client";

import React from "react";

type Props = {
    content: string;
    className?: string;
};

function cx(...parts: Array<string | false | undefined>) {
    return parts.filter(Boolean).join(" ");
}

const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
);

export default function UserMessage({ content, className }: Props) {
    const [copied, setCopied] = React.useState(false);

    async function onCopy() {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            const t = setTimeout(() => setCopied(false), 1200);
            return () => clearTimeout(t);
        } catch {
            // noop
        }
    }

    return (
        <div className={cx("w-full flex justify-end", className)}>
            <div
                className={cx(
                    "group max-w-[80%] rounded-2xl px-4 py-2 text-sm text-white shadow ring-1 ring-black/5"
                )}
                style={{
                    background:
                        "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)",
                }}
            >
                {/* Contenido */}
                <p className="whitespace-pre-wrap break-words">{content}</p>

                {/* Acción: Copiar (sin fondo, aparece en hover) */}
                <div className="mt-1.5 flex justify-end">
                    <button
                        type="button"
                        aria-label="Copiar mensaje"
                        onClick={onCopy}
                        className={cx(
                            "inline-flex items-center gap-1 text-[11.5px]",
                            "opacity-0 pointer-events-none transition-opacity",
                            "group-hover:opacity-100 group-hover:pointer-events-auto",
                            "text-white/85 hover:text-white underline-offset-2 hover:underline",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
                        )}
                    >
                        <IconCopy />
                        <span>{copied ? "Copiado" : "Copiar"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
