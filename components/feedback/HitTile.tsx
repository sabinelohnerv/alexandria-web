"use client";

import * as React from "react";
import type { SearchHitDTO } from "@/lib/search/hits";
import { getHitFileUrl, openHitFileNewTab } from "@/lib/search/hits";
import PdfChip from "@/components/feedback/PdfChip";

/* ── Iconos (coherentes con SystemMessage) ─────────────────────────────── */
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

/* ── Botón icónico con el mismo look ───────────────────────────────────── */
const IconBtn: React.FC<
    React.PropsWithChildren<{ ariaLabel: string; active?: boolean; disabled?: boolean; onClick?: () => void }>
> = ({ ariaLabel, active, disabled, onClick, children }) => (
    <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px]",
            active
                ? "border-[color:var(--brand,#023f66)]/50 text-[color:var(--brand,#023f66)] bg-[color:var(--brand,#023f66)]/10"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            "disabled:opacity-50 disabled:pointer-events-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
        ].join(" ")}
    >
        {children}
    </button>
);

/* ── Encabezado compacto cuando no hay título ──────────────────────────── */
function compactHeader(h: SearchHitDTO) {
    const a = h.document?.authority || "";
    const t = h.document?.doc_type || "";
    const n = h.document?.number || "";
    const parts: string[] = [];
    if (a) parts.push(a);
    if (t) parts.push(t);
    const right: string[] = [];
    if (n) right.push(`Nº ${n}`);
    const leftStr = parts.filter(Boolean).join(" · ");
    const rightStr = right.filter(Boolean).join(" ");
    return [leftStr, rightStr].filter(Boolean).join(" · ");
}

/* ── Props ─────────────────────────────────────────────────────────────── */
type HitTileProps = {
    hit: SearchHitDTO;
    sessionId: number;
    messageId: number;
    /** Si quieres manejar un visor embebido, te paso la URL ya construida */
    onOpenPdf?: (url: string, hit: SearchHitDTO) => void;
};

/* ── Componente ───────────────────────────────────────────────────────── */
export default function HitTile({ hit, sessionId, messageId, onOpenPdf }: HitTileProps) {
    const header = compactHeader(hit);
    const hasTitle = !!hit.document?.title && hit.document.title.trim().length > 0;

    const handleOpenPdf = () => {
        const url = getHitFileUrl(sessionId, messageId, hit.id);
        if (onOpenPdf) {
            onOpenPdf(url, hit);
        } else {
            openHitFileNewTab(sessionId, messageId, hit.id);
        }
    };

    return (
        <li className="rounded-xl border p-3 hover:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {/* Título o encabezado compacto */}
                    {hasTitle ? (
                        <>
                            <div className="font-medium truncate">{hit.document!.title}</div>
                            <div className="text-xs text-slate-600 mt-0.5">{header}</div>
                        </>
                    ) : (
                        <div className="font-medium text-slate-800">{header || "(Sin metadatos relevantes)"}</div>
                    )}

                    {/* Snippet */}
                    {hit.snippet ? <p className="mt-2 text-sm text-slate-700">{hit.snippet}</p> : null}

                    {/* Chip Ver PDF */}
                    <div className="mt-2">
                        <PdfChip label="Ver PDF" onClick={handleOpenPdf} />
                    </div>
                </div>

                {/* Lateral derecho: rank y futuros votos por-hit */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-[11px] text-slate-600 border rounded-full px-2 py-0.5 bg-slate-50">Rank #{hit.rank}</span>
                    <div className="flex items-center gap-1.5">
                        <IconBtn ariaLabel="Like al hit (próximamente)">
                            <ThumbUp />
                            <span>Útil</span>
                        </IconBtn>
                        <IconBtn ariaLabel="Dislike al hit (próximamente)">
                            <ThumbDown />
                            <span>No útil</span>
                        </IconBtn>
                    </div>
                </div>
            </div>
        </li>
    );
}
