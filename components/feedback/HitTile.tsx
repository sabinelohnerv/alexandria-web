// HitTile.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { SearchHitDTO } from "@/lib/search/hits";
import { getHitFileUrl, openHitFileNewTab, compactHeader } from "@/lib/search/hits";
import PdfChip from "@/components/feedback/PdfChip";
import { postHitFeedback, deleteHitFeedback, type FeedbackLabel } from "@/lib/search/feedback";

const IconBtn: React.FC<
    React.PropsWithChildren<{
        ariaLabel: string;
        active?: boolean;
        disabled?: boolean;
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // ← antes era () => void
    }>
> = ({ ariaLabel, active, disabled, onClick, children }) => (
    <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick} // ← ahora acepta el evento tipado
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

type HitTileProps = {
    hit: SearchHitDTO;
    sessionId: number;
    messageId: number;
    onOpenPdf?: (url: string, hit: SearchHitDTO) => void;
    onLocalFeedbackChange?: (hitId: number, label: FeedbackLabel | null, counts: { useful: number; not_useful: number }) => void;

    isActive?: boolean;
    onSelect?: () => void;
    dataHitId?: number;
};

export default function HitTile({
    hit,
    sessionId,
    messageId,
    onOpenPdf,
    onLocalFeedbackChange,
    isActive,
    onSelect,
    dataHitId,
}: HitTileProps) {
    const header = compactHeader(hit);
    const hasTitle = !!hit.document?.title && hit.document.title.trim().length > 0;

    const [mine, setMine] = React.useState<FeedbackLabel | null>((hit as any).my_feedback_label ?? null);
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

        // optimista
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
            if (isUnvote) await deleteHitFeedback(messageId, hit.id);
            else await postHitFeedback(messageId, hit.id, label);
            onLocalFeedbackChange?.(hit.id, nextMine, nextCounts);
        } catch {
            setMine(prevMine);
            setCounts(prevCounts);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <li
            data-hit-id={dataHitId}
            role="option"
            aria-selected={!!isActive}
            className={[
                "group relative rounded-xl border p-3 cursor-pointer",
                isActive ? "border-[color:var(--brand,#023f66)] bg-[color:var(--brand,#023f66)]/5" : "hover:bg-slate-50",
            ].join(" ")}
            onClick={() => {
                onSelect?.();
                handleOpenPdf();
            }}
        >
            {/* left active bar */}
            <span
                aria-hidden
                className={[
                    "absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all",
                    isActive ? "bg-[color:var(--brand,#023f66)] opacity-100" : "bg-slate-200 opacity-0 group-hover:opacity-100",
                ].join(" ")}
            />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    {/* título / encabezado */}
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

                    {/* actions */}
                    {/* actions */}
                    <div className="mt-2 flex items-center gap-2">
                        <div
                            onPointerDownCapture={(e: React.PointerEvent<HTMLDivElement>) => e.stopPropagation()}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                            className="inline-flex"
                        >
                            <PdfChip
                                label={isActive ? "Abierto" : "Ver PDF"}
                                onClick={() => {
                                    // selección visual + abrir visor del padre
                                    onSelect?.();
                                    const url = getHitFileUrl(sessionId, messageId, hit.id);
                                    if (onOpenPdf) onOpenPdf(url, hit);
                                    else openHitFileNewTab(sessionId, messageId, hit.id);
                                }}
                                className={isActive ? "ring-1 ring-[color:var(--brand,#023f66)]/40" : ""}
                            />
                        </div>
                    </div>
                </div>

                {/* votos */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                        <IconBtn
                            ariaLabel="Marcar hit como útil"
                            active={mine === "useful"}
                            disabled={submitting}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggle("useful");
                            }}
                        >
                            <span className="sr-only">Útil</span>
                            {/* icono */}
                            <svg viewBox="0 0 24 24" width="16" height="16" fill={mine === "useful" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-1 7H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9a3 3 0 0 0 3-3v-6a2 2 0 0 0-2-2h-1z" />
                            </svg>
                            <span>Útil</span>
                        </IconBtn>
                        <IconBtn
                            ariaLabel="Marcar hit como no útil"
                            active={mine === "not_useful"}
                            disabled={submitting}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggle("not_useful");
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill={mine === "not_useful" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <path d="M10 15v4a3 3 0 0 0 3 3l1-7h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-9a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1z" />
                            </svg>
                            <span>No útil</span>
                        </IconBtn>
                    </div>
                </div>
            </div>
        </li>
    );
}
