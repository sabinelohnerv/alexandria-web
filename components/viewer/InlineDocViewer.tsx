// InlineDocViewer.tsx
"use client";

import * as React from "react";

type NavControls = {
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
};

type InlineDocViewerProps = {
    url: string;
    title?: string;
    onClose: () => void;
    className?: string;
    rightNav?: NavControls;
};

export default function InlineDocViewer({ url, title, className, rightNav }: InlineDocViewerProps) {
    const [loading, setLoading] = React.useState(true);
    const onLoad = React.useCallback(() => setLoading(false), []);

    return (
        <div className={["flex flex-col h-[70vh] border rounded-xl overflow-hidden", className || ""].join(" ")}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-slate-50">
                {/* Izquierda: abrir en otra pestaña */}
                <div className="shrink-0">
                    {rightNav ? (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={!rightNav.canPrev}
                                onClick={rightNav.onPrev}
                                className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[12.5px] border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                                title="Documento anterior (←)"
                            >
                                ← Anterior
                            </button>
                            <button
                                type="button"
                                disabled={!rightNav.canNext}
                                onClick={rightNav.onNext}
                                className="inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[12.5px] border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                                title="Documento siguiente (→)"
                            >
                                Siguiente →
                            </button>
                        </div>
                    ) : null}

                </div>

                {/* Derecha: navegación */}
                <div className="shrink-0 flex items-center gap-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Abrir en pestaña nueva"
                    >
                        Abrir en otra pestaña
                    </a>
                </div>
            </div>

            {/* Contenido */}
            <div className="relative flex-1 bg-white">
                {loading && (
                    <div className="absolute inset-0 grid place-items-center text-sm text-slate-600">
                        Cargando documento…
                    </div>
                )}
                <iframe src={url} title={title || "Documento"} className="w-full h-full" onLoad={onLoad} />
            </div>
        </div>
    );
}
