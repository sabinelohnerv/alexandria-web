"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useUIStore } from "@/lib/ui/store";
import { useSearchStore } from "@/lib/search/store";
import SessionTile, { SessionPreview } from "@/components/chat/SessionTile";
import Toolbar from "@/components/layout/Toolbar";
import GuideModal from "@/components/help/GuideModal";

/* ── Utils agrupación por fecha ───────────────────────────────────────── */
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isYesterday(d: Date, now = new Date()) {
    const y = new Date(now); y.setDate(now.getDate() - 1); return isSameDay(d, y);
}
function isThisWeek(d: Date, now = new Date()) {
    const day = now.getDay() || 7; const monday = new Date(now);
    monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - (day - 1));
    return d >= monday && d <= now && !isSameDay(d, now) && !isYesterday(d, now);
}
type SectionKey = "today" | "yesterday" | "week" | "older";
function sectionOf(dt: Date): SectionKey {
    const now = new Date();
    if (isSameDay(dt, now)) return "today";
    if (isYesterday(dt, now)) return "yesterday";
    if (isThisWeek(dt, now)) return "week";
    return "older";
}
function groupByDate(sessions: SessionPreview[]) {
    const buckets: Record<SectionKey, SessionPreview[]> = { today: [], yesterday: [], week: [], older: [] };
    for (const s of sessions) buckets[sectionOf(new Date(s.updatedAt))].push(s);
    (Object.keys(buckets) as SectionKey[]).forEach(k => buckets[k].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)));
    return buckets;
}
function SectionHeader({ label }: { label: string }) {
    return <div className="sticky top-0 z-10 bg-white/80 backdrop-blur px-3 py-2 text-xs font-semibold text-slate-600">{label}</div>;
}
function EmptyState({ onCreate, disabled }: { onCreate: () => void; disabled?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="text-slate-400 text-sm">No hay sesiones todavía.</div>
            <button
                type="button"
                onClick={onCreate}
                disabled={disabled}
                className="mt-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
            >
                + Nueva Sesión
            </button>
        </div>
    );
}
function Skeleton() {
    return (
        <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 border-b border-gray-100 px-3 flex items-center gap-3">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-200 rounded ml-auto" />
                </div>
            ))}
        </div>
    );
}

/* ── SidebarInner ─────────────────────────────────────────────────────── */
function SidebarInner() {
    const {
        sessions, currentId, selectSession, renameSession, deleteSession,
        hydrateSessions, loadingSessions, ensureDraft, startDraftSession,
    } = useSearchStore();

    const [query, setQuery] = useState("");
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sessions;
        return sessions.filter(s => (s.title || "").toLowerCase().includes(q));
    }, [sessions, query]);

    const grouped = useMemo(() => groupByDate(filtered), [filtered]);

    useEffect(() => { (async () => { await hydrateSessions(); ensureDraft(); })(); }, [hydrateSessions, ensureDraft]);

    const createSession = useCallback(() => {
        const id = startDraftSession("Búsqueda nueva");
        void selectSession(id);
    }, [startDraftSession, selectSession]);

    /* ── Guía de uso: estado + handlers ── */
    const [guideOpen, setGuideOpen] = useState(false);
    const openGuide = useCallback(() => setGuideOpen(true), []);
    const closeGuide = useCallback(() => setGuideOpen(false), []);

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Header / Toolbar */}
            <Toolbar>
                {/* Fila 1: Historial + Nueva */}
                <Toolbar.Row variant="desktop">
                    <Toolbar.Title>Historial</Toolbar.Title>
                    <Toolbar.Button onClick={createSession} disabled={loadingSessions}>
                        + Nueva Sesión
                    </Toolbar.Button>
                </Toolbar.Row>

                {/* Fila 2: Acciones (solo buscador ahora) */}
                <Toolbar.Row variant="desktop" className="gap-2">
                    <Toolbar.Search
                        placeholder="Buscar sesión…"
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        shortcutHint="⌘K"
                        className="flex-1"
                        aria-label="Buscar en historial"
                    />
                </Toolbar.Row>
            </Toolbar>

            {/* Lista de sesiones */}
            <nav
                className="flex-1 min-h-0 overflow-y-auto bg-white"
                aria-label="Historial de sesiones"
            >
                {loadingSessions ? (
                    <Skeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState onCreate={createSession} disabled={loadingSessions} />
                ) : (
                    <>
                        {grouped.today.length > 0 && (
                            <>
                                <SectionHeader label="Hoy" />
                                <ul className="divide-y divide-gray-100">
                                    {grouped.today.map(s => (
                                        <li key={s.id}>
                                            <SessionTile
                                                session={s}
                                                active={currentId === s.id}
                                                onSelect={selectSession}
                                                onRename={renameSession}
                                                onDelete={deleteSession}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {grouped.yesterday.length > 0 && (
                            <>
                                <SectionHeader label="Ayer" />
                                <ul className="divide-y divide-gray-100">
                                    {grouped.yesterday.map(s => (
                                        <li key={s.id}>
                                            <SessionTile
                                                session={s}
                                                active={currentId === s.id}
                                                onSelect={selectSession}
                                                onRename={renameSession}
                                                onDelete={deleteSession}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {grouped.week.length > 0 && (
                            <>
                                <SectionHeader label="Esta semana" />
                                <ul className="divide-y divide-gray-100">
                                    {grouped.week.map(s => (
                                        <li key={s.id}>
                                            <SessionTile
                                                session={s}
                                                active={currentId === s.id}
                                                onSelect={selectSession}
                                                onRename={renameSession}
                                                onDelete={deleteSession}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {grouped.older.length > 0 && (
                            <>
                                <SectionHeader label="Anteriores" />
                                <ul className="divide-y divide-gray-100">
                                    {grouped.older.map(s => (
                                        <li key={s.id}>
                                            <SessionTile
                                                session={s}
                                                active={currentId === s.id}
                                                onSelect={selectSession}
                                                onRename={renameSession}
                                                onDelete={deleteSession}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </>
                )}
            </nav>

            {/* Footer fijo */}
            <footer className="bg-white px-3 py-2">

                {/* botón Guía de uso */}
                <button
                    type="button"
                    onClick={openGuide}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    title="Abrir guía de uso"
                >
                    {/* Ícono (libro/ayuda) */}
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600" aria-hidden="true">
                        <path
                            fill="currentColor"
                            d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 20.5V6.5ZM6.5 6A.5.5 0 0 0 6 6.5v12A3.5 3.5 0 0 1 9.5 15H20V6H6.5Z"
                        />
                    </svg>
                    Guía de uso
                </button>
            </footer>

            {/* Modal de guía */}
            <GuideModal open={guideOpen} onClose={closeGuide} />
        </div>
    );
}

/* ── Wrapper responsive ───────────────────────────────────────────────── */
export default function Sidebar() {
    const { sidebarOpen } = useUIStore();
    return (
        <>
            {/* Desktop */}
            <aside className="hidden md:flex w-72 shrink-0 flex-col border-r bg-white min-h-0">
                <SidebarInner />
            </aside>

            {/* Mobile */}
            {sidebarOpen && (
                <div className="fixed top-14 bottom-0 left-0 z-50 w-80 md:hidden bg-white border-r flex flex-col min-h-0">
                    <SidebarInner />
                </div>
            )}
        </>
    );
}
