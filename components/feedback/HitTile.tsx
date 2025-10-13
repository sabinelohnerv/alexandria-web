/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { SearchHitDTO } from "@/lib/search/hits";
import { getHitFileUrl, openHitFileNewTab } from "@/lib/search/hits";
import PdfChip from "@/components/feedback/PdfChip";
import {
    postHitFeedback,
    deleteHitFeedback,
    type FeedbackLabel,
} from "@/lib/search/feedback";

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

/* ── Botón icónico ────────────────────────────────────────────────────── */
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
function normalizeDocType(raw?: string | null) {
    if (!raw) return "";
    const s = String(raw)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function compactHeader(h: SearchHitDTO) {
    const a = h.document?.authority || "";
    const t = normalizeDocType(h.document?.doc_type);
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
    /** Si usas visor embebido, te paso la URL ya construida */
    onOpenPdf?: (url: string, hit: SearchHitDTO) => void;
    /** Opcional: propagar cambios al padre */
    onLocalFeedbackChange?: (
        hitId: number,
        label: FeedbackLabel | null,
        counts: { useful: number; not_useful: number }
    ) => void;
};

/* ── Componente ───────────────────────────────────────────────────────── */
export default function HitTile({
    hit,
    sessionId,
    messageId,
    onOpenPdf,
    onLocalFeedbackChange,
}: HitTileProps) {
    const header = compactHeader(hit);
    const hasTitle = !!hit.document?.title && hit.document.title.trim().length > 0;

    // Hidrata estado local desde el DTO si viene con contadores/mi voto
    const [mine, setMine] = React.useState<FeedbackLabel | null>(
        (hit as any).my_feedback_label ?? null
    );
    const [counts, setCounts] = React.useState({
        useful: Number((hit as any).useful_count ?? 0),
        not_useful: Number((hit as any).not_useful_count ?? 0),
    });
    const [submitting, setSubmitting] = React.useState(false);

    const handleOpenPdf = React.useCallback(() => {
        const url = getHitFileUrl(sessionId, messageId, hit.id);
        if (onOpenPdf) onOpenPdf(url, hit);
        else openHitFileNewTab(sessionId, messageId, hit.id);
    }, [hit, sessionId, messageId, onOpenPdf]);

    async function toggle(label: FeedbackLabel) {
        if (submitting) return;
        setSubmitting(true);

        const isUnvote = mine === label;

        // Optimista
        const prevMine = mine;
        const prevCounts = { ...counts };
        let nextMine: FeedbackLabel | null = label;
        const nextCounts = { ...counts };

        if (isUnvote) {
            nextMine = null;
            if (label === "useful" && nextCounts.useful > 0) nextCounts.useful -= 1;
            if (label === "not_useful" && nextCounts.not_useful > 0) nextCounts.not_useful -= 1;
        } else {
            if (label === "useful") {
                nextCounts.useful += 1;
                if (prevMine === "not_useful" && nextCounts.not_useful > 0) nextCounts.not_useful -= 1;
            } else {
                nextCounts.not_useful += 1;
                if (prevMine === "useful" && nextCounts.useful > 0) nextCounts.useful -= 1;
            }
        }

        setMine(nextMine);
        setCounts(nextCounts);

        try {
            if (isUnvote) {
                await deleteHitFeedback(messageId, hit.id);
            } else {
                await postHitFeedback(messageId, hit.id, label);
            }
            onLocalFeedbackChange?.(hit.id, nextMine, nextCounts);
        } catch {
            // revert
            setMine(prevMine);
            setCounts(prevCounts);
        } finally {
            setSubmitting(false);
        }
    }

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
                        <div className="font-medium text-slate-800">
                            {header || "(Sin metadatos relevantes)"}
                        </div>
                    )}

                    {/* Snippet */}
                    {/*hit.snippet ? (
                        <p className="mt-2 text-sm text-slate-700">{hit.snippet}</p>
                    ) : null*/}

                    {/* Chip Ver PDF */}
                    <div className="mt-2">
                        <PdfChip label="Ver PDF" onClick={handleOpenPdf} />
                    </div>
                </div>

                {/* Lateral derecho: rank y votos por-hit */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-[11px] text-slate-600 border rounded-full px-2 py-0.5 bg-slate-50">
                        Rank #{hit.rank}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <IconBtn
                            ariaLabel="Marcar hit como útil"
                            active={mine === "useful"}
                            disabled={submitting}
                            onClick={() => toggle("useful")}
                        >
                            <ThumbUp active={mine === "useful"} />
                            <span>Útil</span>
                        </IconBtn>
                        <IconBtn
                            ariaLabel="Marcar hit como no útil"
                            active={mine === "not_useful"}
                            disabled={submitting}
                            onClick={() => toggle("not_useful")}
                        >
                            <ThumbDown active={mine === "not_useful"} />
                            <span>No útil</span>
                        </IconBtn>
                    </div>
                </div>
            </div>
        </li>
    );
}
