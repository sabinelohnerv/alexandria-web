// InlineDocViewer.tsx
"use client";

import * as React from "react";
import { Search, Sparkles, Eye, EyeOff } from "lucide-react";

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
    snippet?: string | null;
    searchTerms?: string[];
};

export default function InlineDocViewer({ url, title, className, rightNav, snippet, searchTerms = [] }: InlineDocViewerProps) {
    const [loading, setLoading] = React.useState(true);
    const [showSnippetPanel, setShowSnippetPanel] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    
    const onLoad = React.useCallback(() => setLoading(false), []);

    return (
        <div className={["flex flex-col h-[70vh] border rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50/30", className || ""].join(" ")}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm">
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

                {/* Centro: título con animación */}
                <div className="flex-1 min-w-0 px-4">
                    {title && (
                        <div className="text-sm font-medium text-slate-700 truncate animate-fadeIn">
                            {title}
                        </div>
                    )}
                </div>

                {/* Derecha: controles */}
                <div className="shrink-0 flex items-center gap-2">
                    {snippet && (
                        <button
                            type="button"
                            onClick={() => setShowSnippetPanel(!showSnippetPanel)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                            title={showSnippetPanel ? "Ocultar panel de contexto" : "Mostrar panel de contexto"}
                        >
                            {showSnippetPanel ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span className="hidden sm:inline">Contexto</span>
                        </button>
                    )}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                        title="Abrir en pestaña nueva"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span className="hidden sm:inline">Abrir</span>
                    </a>
                </div>
            </div>

            {/* Contenido */}
            <div className="relative flex-1 flex gap-0 overflow-hidden">
                {/* Panel de snippet y términos */}
                {snippet && showSnippetPanel && (
                    <div className="w-80 border-r bg-white/95 backdrop-blur-sm flex flex-col animate-slideInLeft">
                        {/* Header del panel */}
                        <div className="px-4 py-3 border-b bg-gradient-to-r from-[color:var(--brand,#023f66)]/5 to-transparent">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <Sparkles size={16} className="text-[color:var(--brand,#023f66)]" />
                                Contexto del fragmento
                            </div>
                        </div>

                        {/* Snippet destacado */}
                        <div className="px-4 py-3 border-b">
                            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Fragmento relevante</div>
                            <div className="text-sm text-slate-700 leading-relaxed p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg shadow-sm">
                                <div className="relative">
                                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                                    <p className="pl-2">{snippet}</p>
                                </div>
                            </div>
                        </div>

                        {/* Búsqueda personalizada */}
                        <div className="px-4 py-3 border-t bg-slate-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en documento..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--brand,#023f66)]/30 focus:border-[color:var(--brand,#023f66)] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Visor de documento */}
                <div className="flex-1 relative bg-white">
                    {loading && (
                        <div className="absolute inset-0 grid place-items-center text-sm text-slate-600 bg-white/80 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-3 border-[color:var(--brand,#023f66)] border-t-transparent rounded-full animate-spin" />
                                <span>Cargando documento…</span>
                            </div>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        src={url}
                        title={title || "Documento"}
                        className="w-full h-full"
                        onLoad={onLoad}
                    />
                </div>
            </div>

            {/* Estilos de animación */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -10px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideInLeft {
                    animation: slideInLeft 0.3s ease-out;
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                .hover\:scale-102:hover {
                    transform: scale(1.02);
                }
                .scale-105 {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
