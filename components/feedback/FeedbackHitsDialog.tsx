/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { fetchMessageHits, type SearchHitDTO, getHitFileUrl } from "@/lib/search/hits";
import HitTile from "@/components/feedback/HitTile";
import InlineDocViewer from "@/components/viewer/InlineDocViewer";

type Props = {
    open: boolean;
    onClose: () => void;
    sessionId?: number;
    messageId?: number;
};

export default function FeedbackHitsDialog({ open, onClose, sessionId, messageId }: Props) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [hits, setHits] = React.useState<SearchHitDTO[]>([]);

    const [activeHitId, setActiveHitId] = React.useState<number | null>(null);
    const [viewerUrl, setViewerUrl] = React.useState<string | null>(null);
    const [viewerHit, setViewerHit] = React.useState<SearchHitDTO | null>(null);
    const [viewerOpen, setViewerOpen] = React.useState<boolean>(false); 

    // Carga cuando se abre
    React.useEffect(() => {
        let cancelled = false;
        async function run() {
            if (!open) return;
            if (!sessionId || !messageId) {
                setError("Faltan identificadores para cargar los resultados.");
                setHits([]);
                return;
            }
            setLoading(true);
            setError(null);
            setActiveHitId(null);
            setViewerUrl(null);
            setViewerHit(null);
            setViewerOpen(false);
            try {
                const data = await fetchMessageHits(sessionId, messageId, {
                    includeSnippet: true,
                    limit: 10,
                });
                if (!cancelled) setHits(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "No se pudieron cargar los hits.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => {
            cancelled = true;
        };
    }, [open, sessionId, messageId]);

    // Abre visor para un hit (desde tile o atajo)
    const openForHit = React.useCallback(
        (hit: SearchHitDTO) => {
            if (!sessionId || !messageId) return;
            const url = getHitFileUrl(sessionId, messageId, hit.id);
            setActiveHitId(hit.id);
            setViewerUrl(url);
            setViewerHit(hit);
            setViewerOpen(true);
        },
        [sessionId, messageId]
    );

    const handleOpenPdf = React.useCallback(
        (url: string, hit: SearchHitDTO) => {
            setActiveHitId(hit.id);
            setViewerUrl(url);
            setViewerHit(hit);
            setViewerOpen(true);
        },
        []
    );

    const handleCloseViewer = React.useCallback(() => {
        setViewerUrl(null);
        setViewerHit(null);
        setViewerOpen(false);
    }, []);

    React.useEffect(() => {
        if (!open) return;
        function onKeyDown(e: KeyboardEvent) {
            if (!hits.length) return;

            const idx = activeHitId == null ? -1 : hits.findIndex(h => h.id === activeHitId);

            if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = hits[Math.min((idx === -1 ? 0 : idx + 1), hits.length - 1)];
                if (next) setActiveHitId(next.id);
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = hits[Math.max((idx === -1 ? 0 : idx - 1), 0)];
                if (prev) setActiveHitId(prev.id);
            }
            // abrir seleccionado
            if (e.key === "Enter" && idx !== -1) {
                e.preventDefault();
                openForHit(hits[idx]);
            }
            if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && viewerOpen) {
                e.preventDefault();
                let nextIdx = idx;
                if (e.key === "ArrowRight") nextIdx = Math.min(idx + 1, hits.length - 1);
                if (e.key === "ArrowLeft") nextIdx = Math.max(idx - 1, 0);
                const target = hits[nextIdx];
                if (target) openForHit(target);
            }
            if (e.key === "Escape" && viewerOpen) {
                e.preventDefault();
                handleCloseViewer();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, hits, activeHitId, viewerOpen, openForHit, handleCloseViewer]);

    React.useEffect(() => {
        if (activeHitId == null) return;
        const el = document.querySelector<HTMLElement>(`[data-hit-id="${activeHitId}"]`);
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [activeHitId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] grid place-items-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* modal */}
            <div className="relative z-10 w-full max-w-6xl rounded-2xl bg-white shadow-xl border">
                {/* header */}
                <div className="flex items-center justify-between px-5 py-3 border-b">
                    <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-sm font-semibold truncate">Fuentes citadas en esta respuesta</h3>
                        {!viewerUrl ? (
                            <span className="text-xs text-slate-500" aria-live="polite">
                                Selecciona un documento para previsualizar
                            </span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        {viewerUrl ? (
                            <button
                                type="button"
                                onClick={() => setViewerOpen(v => !v)}
                                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                                title={viewerOpen ? "Ocultar visor" : "Mostrar visor"}
                            >
                                {viewerOpen ? "Ocultar visor" : "Mostrar visor"}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                {/* body: lista | visor */}
                <div className="p-4">
                    {!sessionId || !messageId ? (
                        <div className="text-sm text-red-600">
                            No se puede cargar: falta <code>sessionId</code> o <code>messageId</code>.
                        </div>
                    ) : loading ? (
                        <div className="text-sm text-slate-600">Cargando hits…</div>
                    ) : error ? (
                        <div className="text-sm text-red-600">{error}</div>
                    ) : hits.length === 0 ? (
                        <div className="text-sm text-slate-600">No se encontraron resultados para este mensaje.</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Lista de hits */}
                            <div className={viewerUrl && viewerOpen ? "lg:col-span-5" : "lg:col-span-12"}>
                                <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" role="listbox" aria-label="Resultados">
                                    {hits.map((h) => (
                                        <HitTile
                                            key={h.id}
                                            hit={h}
                                            sessionId={sessionId!}
                                            messageId={messageId!}
                                            onOpenPdf={handleOpenPdf}
                                            isActive={viewerOpen && activeHitId === h.id}
                                            onSelect={() => setActiveHitId(h.id)}
                                            dataHitId={h.id}
                                        />
                                    ))}
                                </ul>
                            </div>

                            {/* Visor embebido */}
                            {viewerUrl && viewerOpen && (
                                <div className="lg:col-span-7">
                                    <InlineDocViewer
                                        url={viewerUrl}
                                        title={viewerHit?.document?.title || undefined}
                                        onClose={handleCloseViewer}
                                        className="shadow-sm"
                                        rightNav={{
                                            canPrev: !!activeHitId && hits.findIndex(h => h.id === activeHitId) > 0,
                                            canNext: !!activeHitId && hits.findIndex(h => h.id === activeHitId) < hits.length - 1,
                                            onPrev: () => {
                                                if (activeHitId == null) return;
                                                const idx = hits.findIndex(h => h.id === activeHitId);
                                                if (idx > 0) openForHit(hits[idx - 1]);
                                            },
                                            onNext: () => {
                                                if (activeHitId == null) return;
                                                const idx = hits.findIndex(h => h.id === activeHitId);
                                                if (idx < hits.length - 1) openForHit(hits[idx + 1]);
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
