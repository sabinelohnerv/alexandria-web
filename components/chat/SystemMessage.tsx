/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

import Chip from "@/components/ui/Chip";
import FeedbackHitsDialog from "@/components/feedback/FeedbackHitsDialog";
import { useSearchStore } from "@/lib/search/store";

/* ───────────── Normalización & refs ───────────── */

function normalize(md: string) {
    return md
        .replace(/\r\n?/g, "\n")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]");
}

function highlightRefsFenceAware(md: string) {
    const toInline = (s: string) =>
        s
            .replace(/^\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*$/gm, (_m, a, b) => `\`[${a}:${b}]\``)
            .replace(/\[\s*(\d+)\s*:\s*(\d+)\s*]/g, (_m, a, b) => `\`[${a}:${b}]\``);

    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) parts[i] = toInline(parts[i]);
    return parts.join(FENCE);
}

const cleanRef = (str: string) =>
    String(str ?? "")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]")
        .replace(/\s+/g, "")
        .trim();

const isRef = (str: string) => /^\[\d+:\d+]$/.test(cleanRef(str));

/* ───────────── Tipos & UI helpers ───────────── */

type Props = {
    content: string;
    /** id real del mensaje en backend (para feedback). Si no se pasa, la barra se desactiva. */
    messageId?: number;
    /** sesión actual (requerido por endpoints semánticos). Si no se pasa, la barra se desactiva. */
    sessionId?: number;
    title?: string;
};

type CodeRendererProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
);

const ThumbUp = ({ active }: { active?: boolean }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M14 9V5a3 3 0 0 0-3-3l-1 7H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9a3 3 0 0 0 3-3v-6a2 2 0 0 0-2-2h-1z" />
    </svg>
);

const ThumbDown = ({ active }: { active?: boolean }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M10 15v4a3 3 0 0 0 3 3l1-7h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-9a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1z" />
    </svg>
);

const FeedbackBtn: React.FC<
    React.PropsWithChildren<{
        onClick?: () => void;
        active?: boolean;
        disabled?: boolean;
        icon: React.ReactNode;
        ariaLabel: string;
    }>
> = ({ onClick, active, disabled, icon, ariaLabel, children }) => (
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

/* ───────────── Componente ───────────── */

export default function SystemMessage({ content, title, messageId, sessionId }: Props) {
    const original = content;
    const enhanced = highlightRefsFenceAware(normalize(content));

    // ⛑️ FIX: seleccionar slices por separado (evita objeto nuevo en cada render)
    const feedbackCounts = useSearchStore((s) => s.feedbackCounts);
    const myFeedback = useSearchStore((s) => s.myFeedback);
    const feedbackSubmitting = useSearchStore((s) => s.feedbackSubmitting);
    const toggleFeedback = useSearchStore((s) => s.toggleFeedback);

    const canFeedback =
        typeof messageId === "number" &&
        messageId > 0 &&
        typeof sessionId === "number" &&
        sessionId > 0;

    const counts = canFeedback ? feedbackCounts[messageId!] ?? { useful: 0, not_useful: 0 } : { useful: 0, not_useful: 0 };
    const mine = canFeedback ? myFeedback[messageId!] ?? null : null;
    const busy = canFeedback ? !!feedbackSubmitting[messageId!] : false;

    // copiar
    const [copied, setCopied] = React.useState(false);
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(original);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            /* noop */
        }
    };

    // modal después de votar
    const [openDialog, setOpenDialog] = React.useState(false);
    const openAfterVote = React.useCallback(
        async (label: "useful" | "not_useful") => {
            if (!canFeedback) return;
            await toggleFeedback(messageId!, label, sessionId!);
            setOpenDialog(true);
        },
        [canFeedback, messageId, sessionId, toggleFeedback]
    );

    // renderers markdown
    const mdComponents: Partial<Components> = {
        h1: (p) => <h2 className="text-base font-semibold" {...p} />,
        h2: (p) => <h3 className="text-sm font-semibold" {...p} />,
        h3: (p) => <h4 className="text-sm font-semibold" {...p} />,
        blockquote: (p) => <blockquote className="border-l-4 pl-3 py-1 italic text-slate-700 bg-slate-50 rounded-r" {...p} />,
        pre: ({ children, ...rest }) => {
            const child: any = Array.isArray(children) ? children[0] : children;
            const codeText =
                child && child.props && child.props.children
                    ? String(Array.isArray(child.props.children) ? child.props.children.join("") : child.props.children).trim()
                    : "";
            if (isRef(codeText)) {
                return (
                    <Chip title="Referencia" className="inline-flex align-middle">
                        {cleanRef(codeText)}
                    </Chip>
                );
            }
            return (
                <pre className="rounded-lg border bg-slate-50 p-3 overflow-x-auto" {...rest}>
                    {children}
                </pre>
            );
        },
        code: (props) => {
            const { inline, className, children } = props as CodeRendererProps;
            let raw = "";
            if (Array.isArray(children)) raw = children.map((c) => (typeof c === "string" ? c : "")).join("");
            else raw = String(children ?? "");
            if (inline && isRef(raw)) {
                return (
                    <Chip title="Referencia" className="inline-flex align-middle">
                        {cleanRef(raw)}
                    </Chip>
                );
            }
            return <code className={["rounded border bg-slate-50 px-1 py-[1px] text-[12px]", className || ""].join(" ")}>{raw.trim()}</code>;
        },
        ul: (p) => <ul className="list-disc pl-5 space-y-1" {...p} />,
        ol: (p) => <ol className="list-decimal pl-5 space-y-1" {...p} />,
        a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline decoration-[--brand] underline-offset-2" {...props}>
                {children}
            </a>
        ),
        p: (p) => <p className="leading-relaxed" {...p} />,
    };

    return (
        <>
            <div className="max-w-[80%] bg-white border rounded-2xl p-4 pt-6 pr-16 shadow-sm group relative">
                {/* Copiar */}
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

                <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div
                        aria-hidden
                        className="mt-1 grid place-items-center rounded-full border size-7 text-[--brand]"
                        style={{ borderColor: "var(--brand)" }}
                        title="Sistema"
                    >
                        <Image src="/brand/logo-mark.svg" alt="Sistema" width={26} height={26} priority />
                    </div>

                    <div className="flex-1 min-w-0">
                        {title && <h4 className="font-semibold mb-1">{title}</h4>}

                        <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-code:before:content-[''] prose-code:after:content-['']">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {enhanced}
                            </ReactMarkdown>
                        </div>

                        {/* Feedback bar */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[12.5px] text-slate-500">¿Fue útil esta respuesta?</span>
                                <div className="flex items-center gap-1.5">
                                    <FeedbackBtn
                                        ariaLabel="Marcar como útil"
                                        onClick={() => openAfterVote("useful")}
                                        active={mine === "useful"}
                                        disabled={!canFeedback || busy}
                                        icon={<ThumbUp active={mine === "useful"} />}
                                    >
                                        Sí {counts.useful > 0 ? `(${counts.useful})` : ""}
                                    </FeedbackBtn>
                                    <FeedbackBtn
                                        ariaLabel="Marcar como no útil"
                                        onClick={() => openAfterVote("not_useful")}
                                        active={mine === "not_useful"}
                                        disabled={!canFeedback || busy}
                                        icon={<ThumbDown active={mine === "not_useful"} />}
                                    >
                                        No {counts.not_useful > 0 ? `(${counts.not_useful})` : ""}
                                    </FeedbackBtn>
                                </div>
                            </div>
                        </div>
                        {/* /Feedback bar */}
                    </div>
                </div>
            </div>

            {/* Renderiza el diálogo SOLO si hay ids válidos (evita number|undefined) */}
            {canFeedback && (
                <FeedbackHitsDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    messageId={messageId!}
                    sessionId={sessionId!}
                />
            )}
        </>
    );
}
