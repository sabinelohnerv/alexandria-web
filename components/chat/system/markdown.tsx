/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { Components } from "react-markdown";
import Chip from "@/components/ui/Chip";
import SourceChipLink from "./SourceChipLink";

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

/* ── Quitar/Reemplazar sección de fuentes (fence-aware) ─────────────────── */

function _replaceSourcesSection(raw: string, replacement = ""): string {
    const KW = String.raw`(?:fuentes(?:\s+citadas)?|referencias|bibliograf[ií]a)`;

    const headingPattern = new RegExp(
        String.raw`(^|\n)\s{0,3}#{1,6}\s*${KW}\s*:?\s*(?:\n+|$)[\s\S]*?(?=(?:\n\s{0,3}#{1,6}\s+\S)|$)`,
        "gi"
    );

    const htmlHeadingPattern = new RegExp(
        String.raw`<h[1-6][^>]*>\s*${KW}\s*:?\s*<\/h[1-6]>\s*[\s\S]*?(?=(?:<h[1-6]\b)|$)`,
        "gi"
    );

    const labelBlockPattern = new RegExp(
        String.raw`(^|\n)\s*(?:\*\*|__)?\s*${KW}\s*:?\s*(?:\*\*|__)?\s*:?\s*(?:\n+)[\s\S]*?(?=(?:\n\s{0,3}#{1,6}\s+\S)|$)`,
        "gi"
    );

    const singleLinePattern = new RegExp(
        String.raw`(^|\n)[^\n]*\b${KW}\b[^\n]*$`,
        "gi"
    );

    const htmlLabelBlockPattern = new RegExp(
        String.raw`(?:^|\n|\r|\s)(?:<p[^>]*>\s*)?(?:<strong>|<b>)\s*${KW}\s*:?\s*(?:<\/strong>|<\/b>)\s*:?\s*(?:<\/p>)?\s*(?:\n|<br\s*\/?>|\r\n|\r|\s)*[\s\S]*?(?=(?:\n\s{0,3}#{1,6}\s+\S)|<h[1-6]\b|$)`,
        "gi"
    );

    const htmlSingleLinePattern = new RegExp(
        String.raw`(^|\n)[^\n]*?(?:<strong>|<b>)\s*${KW}\s*:?\s*(?:<\/strong>|<\/b>)\s*:?[^\n]*$`,
        "gi"
    );

    const inject = (pfx: string) => (pfx ? pfx : "") + (replacement ? `\n${replacement}\n` : "");

    let s = raw;
    s = s.replace(htmlHeadingPattern, (_m) => (replacement ? `\n${replacement}\n` : ""));
    s = s.replace(headingPattern, (_m, p1) => inject(p1));
    s = s.replace(htmlLabelBlockPattern, (_m) => (replacement ? `\n${replacement}\n` : ""));
    s = s.replace(labelBlockPattern, (_m, p1) => inject(p1));
    s = s.replace(htmlSingleLinePattern, (_m, p1) => inject(p1));
    s = s.replace(singleLinePattern, (_m, p1) => inject(p1));
    return s;
}

/** Reemplaza la sección de fuentes fuera de fences ``` */
export function replaceSourcesSectionFenceAware(md: string, replacement = ""): string {
    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) {
        parts[i] = _replaceSourcesSection(parts[i], replacement);
    }
    return parts.join(FENCE);
}

export const SOURCES_SLOT = "...";

/** Atajo: elimina la sección de fuentes (sin reemplazo) */
export function stripSourcesSectionFenceAware(md: string): string {
    return replaceSourcesSectionFenceAware(md, "");
}

/* ── Helpers internos ───────────────────── */

function toText(node: any): string {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(toText).join("");
    if (node.props && node.props.children) return toText(node.props.children);
    return "";
}

/* ── Renderers markdown ───────────────────── */

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

            if (inline) {
                if (isRef(raw)) {
                    return (
                        <Chip title="Referencia" className="inline-flex align-middle">
                            {cleanRef(raw)}
                        </Chip>
                    );
                }
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

        a: ({ href, children, ...props }) => {
            const kids = React.Children.toArray(children);

            let codeChild: any = null;
            for (const k of kids) {
                if (React.isValidElement(k) && (k as any).type === "code") {
                    codeChild = k;
                    break;
                }
            }

            if (!codeChild && kids.length === 1) {
                const text = toText(kids[0]);
                if (text) {
                    codeChild = { props: { children: text } } as any;
                }
            }

            if (codeChild && typeof href === "string") {
                const label = String(codeChild.props?.children ?? "").trim();
                return <SourceChipLink href={href} label={label} />;
            }

            // Enlace normal
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[--brand] underline-offset-2"
                    {...props}
                >
                    {children}
                </a>
            );
        },

        p: (p) => <p className="leading-relaxed" {...p} />,
    };
}
