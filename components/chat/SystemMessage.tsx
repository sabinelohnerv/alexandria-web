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

/* -------- Componente -------- */

export default function SystemMessage({ content, title }: Props) {
    const enhanced = highlightRefsFenceAware(normalize(content));

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

            // Evitar propagar props internos (como `node`, `inline`) al DOM:
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
        <div className="max-w-[80%] bg-white border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
                {/* Icono */}
                <div
                    aria-hidden
                    className="mt-1 grid place-items-center rounded-full border size-7 text-[--brand]"
                    style={{ borderColor: "var(--brand)" }}
                    title="Sistema"
                >
                    <Image
                        src="/brand/logo-mark.svg"
                        alt="Sistema"
                        width={26}
                        height={26}
                        priority
                    />

                </div>

                <div className="flex-1 min-w-0">
                    {title && <h4 className="font-semibold mb-1">{title}</h4>}

                    <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-code:before:content-[''] prose-code:after:content-['']">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {enhanced}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
