/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { fetchMessageHits, type SearchHitDTO } from "@/lib/search/hits";
import HitTile from "@/components/feedback/HitTile";

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

    // carga cuando se abre
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
            try {
                const data = await fetchMessageHits(sessionId, messageId, { includeSnippet: true, limit: 10 });
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

    if (!open) return null;

    // Placeholder para integrar visor PDF
    const onOpenPdf = (hit: SearchHitDTO) => {
        // TODO: integrar visor; por ahora solo log
        // Puedes abrir un drawer/modal con el PDF del documento: hit.document?.pdf_url (si viene) o vía otro endpoint.
        console.log("Ver PDF de hit:", hit.id, hit.document);
    };

    return (
        <div className="fixed inset-0 z-[60] grid place-items-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* modal */}
            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-xl border">
                {/* header */}
                <div className="flex items-center justify-between px-5 py-3 border-b">
                    <h3 className="text-sm font-semibold">Resultados citados en esta respuesta</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Cerrar
                    </button>
                </div>

                {/* body */}
                <div className="max-h-[70vh] overflow-y-auto p-4">
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
                        <ul className="space-y-3">
                            {hits.map((h) => (
                                <HitTile key={h.id} hit={h} onOpenPdf={onOpenPdf} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
