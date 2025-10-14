/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { Components } from "react-markdown";
import Chip from "@/components/ui/Chip";
import SourceChipLink from "./SourceChipLink";

/* ========= Tipos para ref-chips ========= */
export type RefChip = { label: string; href: string };
export type RefChipMap = Record<string, RefChip>;
export const RefChipContext = React.createContext<RefChipMap | null>(null);

/* ========= Normalización & refs ========= */

export function normalize(md: string) {
    return md
        .replace(/\r\n?/g, "\n")
        .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
        .replace(/\uFF1A/g, ":")
        .replace(/[\u3010\uFF3B]/g, "[")
        .replace(/[\u3011\uFF3D]/g, "]");
}

/** Corrige refs mal formadas dentro de texto (respeta bloques ``` ```):
 *  - [doc_id:73:1171]      -> [73:1171]
 *  - [document:73:1171]    -> [73:1171]
 *  - [docid:73:1171]       -> [73:1171]
 *  - [73:73:1171]          -> [73:1171]   (defensa por si se repite el doc numérico)
 *  - espacios/UNICODE      -> limpiados
 */
export function fixMalformedRefsFenceAware(md: string) {
  const FENCE = "```";
  const parts = md.split(FENCE);

  const fix = (s: string) => s
    // 1) Normalizar unicode/espacios y corchetes "raros"
    .replace(/[\u00A0\u2009\u200A\u200B\u202F]/g, " ")
    .replace(/\uFF1A/g, ":")
    .replace(/[\u3010\uFF3B]/g, "[")
    .replace(/[\u3011\uFF3D]/g, "]")
    // 2) [doc_id:73:1171] / [document:73:1171] / [docid:73:1171] -> [73:1171]
    .replace(
      /\[\s*(?:doc[_\s-]*id|doc(?:ument)?|document)\s*:\s*(\d+)\s*:\s*(\d+)\s*]/gi,
      (_m, a, b) => `[${a}:${b}]`
    )
    // 3) Defensa: si alguien duplica el doc numérico [73:73:1171] -> [73:1171]
    .replace(/\[\s*(\d+)\s*:\s*\1\s*:\s*(\d+)\s*]/g, (_m, a, b) => `[${a}:${b}]`)
    // 4) Compactar espacios dentro de la ref
    .replace(/\[\s*(\d+)\s*:\s*(\d+)\s*]/g, (_m, a, b) => `[${a}:${b}]`);

  for (let i = 0; i < parts.length; i += 2) parts[i] = fix(parts[i]);
  return parts.join(FENCE);
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

/* ========= Eliminar/Reemplazar sección Fuentes (fence-aware) ========= */

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

export function replaceSourcesSectionFenceAware(md: string, replacement = ""): string {
    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) {
        parts[i] = _replaceSourcesSection(parts[i], replacement);
    }
    return parts.join(FENCE);
}

export const SOURCES_SLOT = "...";

export function stripSourcesSectionFenceAware(md: string): string {
    return replaceSourcesSectionFenceAware(md, "");
}

/* ==== Linkificar refs [doc:hit] / [doc:chunk] (fence-aware) ==== */

export type RefResolveResult = { label: string; href: string } | null;
export type RefResolver = (docId: number, secondId: number) => RefResolveResult;

function escapeBacktickedLabel(s: string) {
    // Escapa solo lo necesario para usarlo dentro de `...`
    return String(s).replace(/`/g, "\\`").trim();
}

/**
 * Reemplaza referencias como [123:456] por enlaces markdown:
 *    [`TSJ Nº 89293`](/api/backend/...)
 * Respeta los bloques fenced ``` ```
 */
export function linkifyRefsFenceAware(md: string, resolve: RefResolver): string {
    const FENCE = "```";
    const parts = md.split(FENCE);
    for (let i = 0; i < parts.length; i += 2) {
        parts[i] = parts[i].replace(/\[\s*(\d+)\s*:\s*(\d+)\s*]/g, (_m, a, b) => {
            const docId = Number(a);
            const second = Number(b);
            const r = resolve(docId, second);
            if (!r) return _m;
            const label = escapeBacktickedLabel(r.label);
            const href = r.href;
            return `[\\\`${label}\\\`](${href})`;
        });
    }
    return parts.join(FENCE);
}


/* ========= Helpers ========= */

function toText(node: any): string {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(toText).join("");
    if (node.props && node.props.children) return toText(node.props.children);
    return "";
}

/* ========= Tipos de renderer ========= */

type CodeRendererProps = {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/* ========= Componente renderer para <code> (para poder usar hooks) ========= */

function InlineCodeRenderer(props: CodeRendererProps) {
    const { inline, className, children } = props;
    const refsMap = React.useContext(RefChipContext);

    let raw = "";
    if (Array.isArray(children))
        raw = children.map((c) => (typeof c === "string" ? c : "")).join("");
    else raw = String(children ?? "");

    if (inline) {
        // 1) Si es referencia tipo [doc:hit] y hay match, renderiza chip de fuente
        if (isRef(raw)) {
            const key = cleanRef(raw); // "[doc:hit]"
            const match = refsMap?.[key];
            if (match) {
                return <SourceChipLink href={match.href} label={match.label} />;
            }
            return (
                <Chip title="Referencia" className="inline-flex align-middle">
                    {key}
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
}

/* ========= Renderers markdown ========= */

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

        code: (props) => <InlineCodeRenderer {...(props as CodeRendererProps)} />,

        ul: (p) => <ul className="list-disc pl-5 space-y-1" {...p} />,
        ol: (p) => <ol className="list-decimal pl-5 space-y-1" {...p} />,

        // Links: si el link tiene como único hijo un <code>, lo convertimos a chip clickeable
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
                if (text) codeChild = { props: { children: text } } as any;
            }

            if (codeChild && typeof href === "string") {
                const label = String(codeChild.props?.children ?? "").trim();
                return <SourceChipLink href={href} label={label} />;
            }

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
