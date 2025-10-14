"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useUIStore } from "@/lib/ui/store";
import { useSearchStore } from "@/lib/search/store";
import SessionTile, { SessionPreview } from "@/components/chat/SessionTile";
import Toolbar from "@/components/layout/Toolbar";

/* ── Utils de agrupación por fecha (igual que antes) ───────────────────── */
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isYesterday(d: Date, now = new Date()) { const y = new Date(now); y.setDate(now.getDate() - 1); return isSameDay(d, y); }
function isThisWeek(d: Date, now = new Date()) { const day = now.getDay() || 7; const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - (day - 1)); return d >= monday && d <= now && !isSameDay(d, now) && !isYesterday(d, now); }
type SectionKey = "today" | "yesterday" | "week" | "older";
function sectionOf(dt: Date): SectionKey { const now = new Date(); if (isSameDay(dt, now)) return "today"; if (isYesterday(dt, now)) return "yesterday"; if (isThisWeek(dt, now)) return "week"; return "older"; }
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

/* ── SidebarInner ──────────────────────────────────────────────────────── */
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

    // teclado
    const currentIndex = useMemo(() => sessions.findIndex(s => s.id === currentId), [sessions, currentId]);
    const onKeyDownList = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!sessions.length) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const dir = e.key === "ArrowDown" ? 1 : -1;
            const next = Math.max(0, Math.min(sessions.length - 1, (currentIndex < 0 ? 0 : currentIndex) + dir));
            const id = sessions[next]?.id;
            if (id != null) void selectSession(id);
        } else if (e.key === "Enter") {
            if (currentId != null) void selectSession(currentId);
        }
    }, [sessions, currentId, currentIndex, selectSession]);

    useEffect(() => { (async () => { await hydrateSessions(); ensureDraft(); })(); }, [hydrateSessions, ensureDraft]);

    const createSession = useCallback(() => {
        const id = startDraftSession("Búsqueda nueva");
        void selectSession(id);
    }, [startDraftSession, selectSession]);

    const openGuide = useCallback(() => {
        // Hookea tu modal/panel de guía aquí
        window.dispatchEvent(new CustomEvent("open-user-guide"));
    }, []);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <Toolbar>
                {/* Fila 1: Historial + Nueva */}
                <Toolbar.Row variant="desktop">
                    <Toolbar.Title>Historial</Toolbar.Title>
                    <Toolbar.Button onClick={createSession} disabled={loadingSessions}>
                        + Nueva Sesión
                    </Toolbar.Button>
                </Toolbar.Row>

                {/* Fila 2: Acciones */}
                <Toolbar.Row variant="desktop" className="gap-2">
                    <Toolbar.Search
                        placeholder="Buscar sesión…"
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        shortcutHint="⌘K"
                        className="flex-1"
                        aria-label="Buscar en historial"
                    />
                    <Toolbar.Button variant="secondary" onClick={openGuide} title="Abrir guía de usuario">
                        Guía
                    </Toolbar.Button>
                </Toolbar.Row>
            </Toolbar>

            {/* Lista de sesiones */}
            <nav
                className="flex-1 min-h-0 overflow-y-auto bg-white"
                onKeyDown={onKeyDownList}
                tabIndex={0}
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
        </div>
    );
}

/* ── Wrapper responsive ────────────────────────────────────────────────── */
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
                    {/* Puedes usar variant="mobile" si quieres compactar paddings en móvil */}
                    <SidebarInner />
                </div>
            )}
        </>
    );
}