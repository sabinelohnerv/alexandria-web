/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
    open: boolean;
    onClose: () => void;
    url?: string;
    title?: string;
};

/** Botón pequeño del toolbar */
function TBtn({ onClick, children, ariaLabel, disabled }: React.PropsWithChildren<{ onClick?: () => void; ariaLabel: string; disabled?: boolean }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            disabled={disabled}
            className={[
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm",
                "border-slate-200 text-slate-700 hover:bg-slate-50",
                "disabled:opacity-50 disabled:pointer-events-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand,#023f66)]/40",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export default function PdfViewerModal({ open, onClose, url, title }: Props) {
    const [numPages, setNumPages] = React.useState<number>(0);
    const [page, setPage] = React.useState<number>(1);
    const [scale, setScale] = React.useState<number>(1.1);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    // reset al abrir/cambiar url
    React.useEffect(() => {
        if (!open) return;
        setNumPages(0);
        setPage(1);
        setScale(1.1);
        setError(null);
    }, [open, url]);

    // evitar scroll del body cuando el modal está abierto
    React.useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    const canPrev = page > 1;
    const canNext = numPages > 0 && page < numPages;

    const zoomIn = () => setScale((s) => Math.min(3, s + 0.1));
    const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
    const fitWidth = () => setScale(1.1);

    const onDocLoad = ({ numPages: n }: { numPages: number }) => {
        setNumPages(n);
        setLoading(false);
    };

    const src = url
        ? { url, withCredentials: true as const }
        : undefined;

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 flex w-[96vw] max-w-6xl max-h-[92vh] flex-col rounded-2xl border bg-white">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {title || "Documento"}
                        </div>
                        {url ? (
                            <div className="truncate text-[11px] text-slate-500">{url}</div>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                        <TBtn ariaLabel="Zoom menos" onClick={zoomOut}>−</TBtn>
                        <span className="text-sm tabular-nums w-12 text-center">{Math.round(scale * 100)}%</span>
                        <TBtn ariaLabel="Zoom más" onClick={zoomIn}>+</TBtn>
                        <TBtn ariaLabel="Ajustar ancho" onClick={fitWidth}>Ajustar</TBtn>

                        <div className="w-px h-5 bg-slate-200 mx-1" />

                        <TBtn ariaLabel="Página anterior" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>←</TBtn>
                        <span className="text-sm tabular-nums">
                            {page} / {numPages || "–"}
                        </span>
                        <TBtn ariaLabel="Página siguiente" onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={!canNext}>→</TBtn>

                        <div className="w-px h-5 bg-slate-200 mx-1" />

                        {url ? (
                            <>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm border-slate-200 text-slate-700 hover:bg-slate-50"
                                    aria-label="Abrir en una pestaña"
                                >
                                    Abrir
                                </a>
                                <a
                                    href={url}
                                    download
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm border-slate-200 text-slate-700 hover:bg-slate-50"
                                    aria-label="Descargar PDF"
                                >
                                    Descargar
                                </a>
                            </>
                        ) : null}

                        <TBtn ariaLabel="Cerrar visor" onClick={onClose}>Cerrar</TBtn>
                    </div>
                </div>

                {/* Viewer */}
                <div className="flex-1 overflow-auto bg-slate-50">
                    {!url ? (
                        <div className="p-6 text-sm text-red-600">No se proporcionó URL del documento.</div>
                    ) : (
                        <div className="flex justify-center py-4">
                            <Document
                                file={src}
                                loading={() => {
                                    if (!loading) setLoading(true);
                                    return <div className="text-sm text-slate-600">Cargando documento…</div>;
                                }}
                                onLoadSuccess={onDocLoad}
                                onLoadError={(e: any) => setError(e?.message || "No se pudo cargar el PDF")}
                            >
                                {error ? (
                                    <div className="p-4 text-sm text-red-600">{error}</div>
                                ) : (
                                    <Page
                                        pageNumber={page}
                                        scale={scale}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                )}
                            </Document>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
