/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import Chip from "@/components/ui/Chip";
import Image from "next/image";

/* -------- Normalización y resaltado fence-aware -------- */

function normalize(md: string) {
    return md
        .replace(/\r\n?/g, "\n")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]");
}

// Tu idea, extendida para espacios: [ 1234 : 5678 ] -> `[1234:5678]`
function highlightRefs(md: string) {
    // refs en línea
    let s = md.replace(/\[\s*(\d+)\s*:\s*(\d+)\s*]/g, (_m, a, b) => `\`[${a}:${b}]\``);
    // si una línea es SOLO la ref, igual con backticks
    s = s.replace(/^\s*\`\[(\d+):(\d+)\]\`\s*$/gm, (_m, a, b) => `\`[${a}:${b}]\``);
    return s;
}

// NO tocar lo que esté dentro de fences ```
function highlightRefsFenceAware(md: string) {
    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) {
        parts[i] = highlightRefs(parts[i]);
    }
    return parts.join(FENCE);
}

/* -------- Utils de detección/limpieza -------- */

const cleanRef = (str: string) =>
    String(str ?? "")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]")
        .replace(/\s+/g, "")
        .trim();

const isRef = (str: string) => /^\[\d+:\d+]$/.test(cleanRef(str));

/* -------- Tipos -------- */

type Props = { content: string; title?: string };

type CodeRendererProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/* -------- Iconos -------- */

const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
);

const IconThumbUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M14 9V5a3 3 0 0 0-3-3l-1 7H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9a3 3 0 0 0 3-3v-6a2 2 0 0 0-2-2h-1z" />
    </svg>
);

const IconThumbDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M10 15v4a3 3 0 0 0 3 3l1-7h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-9a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1z" />
    </svg>
);

/* -------- Botón (presentacional) -------- */

type FBButtonProps = {
    children: React.ReactNode;
    icon?: React.ReactNode;
    ariaLabel: string;
};

const FeedbackButton: React.FC<FBButtonProps> = ({ children, icon, ariaLabel }) => (
    <button
        type="button"
        aria-label={ariaLabel}
        className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px]",
            "border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
        ].join(" ")}
    >
        {icon}
        <span>{children}</span>
    </button>
);

/* -------- Componente -------- */

export default function SystemMessage({ content, title }: Props) {
    // Texto original para copiar:
    const original = content;
    // Texto transformado para render:
    const enhanced = highlightRefsFenceAware(normalize(content));

    const [copied, setCopied] = React.useState(false);

    async function onCopy() {
        try {
            await navigator.clipboard.writeText(original);
            setCopied(true);
            const t = setTimeout(() => setCopied(false), 1200);
            // limpiar timeout si el componente desmonta durante la animación
            return () => clearTimeout(t);
        } catch {
            // noop
        }
    }

    const mdComponents: Partial<Components> = {
        h1: (p) => <h2 className="text-base font-semibold" {...p} />,
        h2: (p) => <h3 className="text-sm font-semibold" {...p} />,
        h3: (p) => <h4 className="text-sm font-semibold" {...p} />,

        blockquote: (p) => (
            <blockquote className="border-l-4 pl-3 py-1 italic text-slate-700 bg-slate-50 rounded-r" {...p} />
        ),

        /* Bloques ```...``` */
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

        /* Inline code -> Chip si es ref */
        code: (props) => {
            const { inline, className, children } = props as CodeRendererProps;

            // Extrae texto de children de forma robusta
            let raw = "";
            if (Array.isArray(children)) {
                raw = children.map((c) => (typeof c === "string" ? c : "")).join("");
            } else {
                raw = String(children ?? "");
            }

            if (inline && isRef(raw)) {
                return (
                    <Chip title="Referencia" className="inline-flex align-middle">
                        {cleanRef(raw)}
                    </Chip>
                );
            }

            // Evitar propagar props internos al DOM
            return (
                <code className={["rounded border bg-slate-50 px-1 py-[1px] text-[12px]", className || ""].join(" ")}>
                    {raw.trim()}
                </code>
            );
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
        <div className="max-w-[80%] bg-white border rounded-2xl p-4 pt-6 pr-16 shadow-sm group relative">
            {/* Botón de Copiar (aparece al hover/focus) */}
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

                    {/* -------- Barra de Feedback (solo UI) -------- */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[12.5px] text-slate-500">¿Fue útil esta respuesta?</span>
                            <div className="flex items-center gap-1.5">
                                <FeedbackButton ariaLabel="Marcar como útil" icon={<IconThumbUp />}>
                                    Sí
                                </FeedbackButton>
                                <FeedbackButton ariaLabel="Marcar como no útil" icon={<IconThumbDown />}>
                                    No
                                </FeedbackButton>
                            </div>
                        </div>
                    </div>
                    {/* -------------------------------------------- */}
                </div>
            </div>
        </div>
    );
}
