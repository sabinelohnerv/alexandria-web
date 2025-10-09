/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { Components } from "react-markdown";
import Chip from "@/components/ui/Chip";

/* ── Normalización & refs ─────────────────────────────────────────────── */

export function normalize(md: string) {
    return md
        .replace(/\r\n?/g, "\n")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]");
}

export function highlightRefsFenceAware(md: string) {
    const toInline = (s: string) =>
        s
            .replace(/^\s*\[\s*(\d+)\s*:\s*(\d+)\s*]\s*$/gm, (_m, a, b) => `\`[${a}:${b}]\``)
            .replace(/\[\s*(\d+)\s*:\s*(\d+)\s*]/g, (_m, a, b) => `\`[${a}:${b}]\``);

    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) parts[i] = toInline(parts[i]);
    return parts.join(FENCE);
}

export const cleanRef = (str: string) =>
    String(str ?? "")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]")
        .replace(/\s+/g, "")
        .trim();

export const isRef = (str: string) => /^\[\d+:\d+]$/.test(cleanRef(str));

/* ── Renderers markdown (factory para poder reusar) ───────────────────── */

type CodeRendererProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function makeMarkdownComponents(): Partial<Components> {
    return {
        h1: (p) => <h2 className="text-base font-semibold" {...p} />,
        h2: (p) => <h3 className="text-sm font-semibold" {...p} />,
        h3: (p) => <h4 className="text-sm font-semibold" {...p} />,

        blockquote: (p) => (
            <blockquote
                className="border-l-4 pl-3 py-1 italic text-slate-700 bg-slate-50 rounded-r"
                {...p}
            />
        ),

        pre: ({ children, ...rest }) => {
            const child: any = Array.isArray(children) ? children[0] : children;
            const codeText =
                child && child.props && child.props.children
                    ? String(
                        Array.isArray(child.props.children)
                            ? child.props.children.join("")
                            : child.props.children
                    ).trim()
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
            if (Array.isArray(children))
                raw = children.map((c) => (typeof c === "string" ? c : "")).join("");
            else raw = String(children ?? "");

            if (inline && isRef(raw)) {
                return (
                    <Chip title="Referencia" className="inline-flex align-middle">
                        {cleanRef(raw)}
                    </Chip>
                );
            }
            return (
                <code
                    className={[
                        "rounded border bg-slate-50 px-1 py-[1px] text-[12px]",
                        className || "",
                    ].join(" ")}
                >
                    {raw.trim()}
                </code>
            );
        },

        ul: (p) => <ul className="list-disc pl-5 space-y-1" {...p} />,
        ol: (p) => <ol className="list-decimal pl-5 space-y-1" {...p} />,
        a: ({ href, children, ...props }) => (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-[--brand] underline-offset-2"
                {...props}
            >
                {children}
            </a>
        ),
        p: (p) => <p className="leading-relaxed" {...p} />,
    };
}
