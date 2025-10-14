"use client";

import * as React from "react";
import clsx from "clsx";

type Props = {
    value: string;
    onChange: (v: string) => void;
    onSend: (v: string) => void | Promise<void>;
    placeholder?: string;
    loading?: boolean;        // deshabilita input/botón mientras envías
    disabled?: boolean;       // deshabilita manualmente (ej. sin sesión)
    minRows?: number;         // alto mínimo
    maxRows?: number;         // alto máximo antes de overflow
    className?: string;
};

function autoResize(el: HTMLTextAreaElement, maxRows = 6) {
    const lineHeight = parseInt(window.getComputedStyle(el).lineHeight || "20", 10);
    el.style.height = "auto";
    const rows = Math.floor(el.scrollHeight / lineHeight);
    const maxHeight = lineHeight * Math.max(1, maxRows);
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = rows > maxRows ? "auto" : "hidden";
}

export default function MessageComposer({
    value,
    onChange,
    onSend,
    placeholder = "Escribe tu mensaje…",
    loading = false,
    disabled = false,
    minRows = 1,
    maxRows = 6,
    className,
}: Props) {
    const ref = React.useRef<HTMLTextAreaElement | null>(null);

    // auto-resize en cambios
    React.useEffect(() => {
        if (ref.current) autoResize(ref.current, maxRows);
    }, [value, maxRows]);

    const canSend = !loading && !disabled && value.trim().length > 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter para enviar, Shift+Enter para nueva línea
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend) void onSend(value.trim());
            return;
        }
        // Cmd/Ctrl+Enter para enviar (multiplataforma)
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (canSend) void onSend(value.trim());
        }
    };

    const handleSendClick = () => {
        if (canSend) void onSend(value.trim());
    };

    return (
        <div
            className={clsx(
                "mx-auto max-w-3xl w-full",
                "rounded-2xl border bg-white shadow-sm",
                "focus-within:ring-2 focus-within:ring-[--brand] focus-within:ring-offset-2",
                className
            )}
            aria-label="Caja de mensaje"
        >
            {/* Editor */}
            <div className="flex items-end gap-2 px-3 py-3">

                <textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={minRows}
                    className={clsx(
                        "flex-1 resize-none bg-transparent outline-none",
                        "text-sm leading-6 placeholder:text-slate-400",
                        "min-h-[2.25rem] py-2"
                    )}
                    aria-label="Escribe tu mensaje"
                    disabled={loading || disabled}
                />

                <button
                    type="button"
                    onClick={handleSendClick}
                    disabled={!canSend}
                    className={clsx(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition-transform",
                        "disabled:opacity-60 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[--brand]"
                    )}
                    style={{
                        background:
                            "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)",
                    }}
                    aria-label="Enviar mensaje"
                    title="Enviar"
                >
                    {/* Ícono avión de papel */}
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path
                            fill="currentColor"
                            d="M3.4 12.9 19.3 4.6c1-.5 2 .5 1.5 1.5l-8.3 15.9c-.5 1.1-2.1.9-2.3-.3l-1.1-5.5-5.5-1.1c-1.2-.2-1.4-1.8-.2-2.2Z"
                        />
                    </svg>
                    {loading ? "Enviando…" : "Enviar"}
                </button>
            </div>
        </div>
    );
}
