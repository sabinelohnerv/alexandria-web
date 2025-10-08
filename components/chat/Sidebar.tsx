"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/ui/store";
import { useSearchStore } from "@/lib/search/store";
import SessionTile from "@/components/chat/SessionTile";

function SidebarInner() {
    const {
        sessions,
        currentId,
        selectSession,
        renameSession,
        deleteSession,
        hydrateSessions,
        loadingSessions,
        ensureDraft,
        startDraftSession,
    } = useSearchStore();


    useEffect(() => {
        (async () => {
            await hydrateSessions();
            ensureDraft();
        })();
    }, [hydrateSessions, ensureDraft]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Historial</h2>
                <button
                    type="button"
                    onClick={() => {
                        const id = startDraftSession("Búsqueda nueva");
                        void selectSession(id);
                    }}
                    disabled={loadingSessions}
                    className="rounded-lg px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                >
                    + Nueva Sesión
                </button>
            </div>

            {/* Lista de sesiones */}
            <nav className="flex-1 min-h-0 overflow-y-scroll bg-white divide-y divide-gray-200">
                {sessions.map((s) => (
                    <SessionTile
                        key={s.id}
                        session={s}
                        active={currentId === s.id}
                        onSelect={selectSession}
                        onRename={renameSession}
                        onDelete={deleteSession}
                    />
                ))}

                {!loadingSessions && sessions.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">No hay sesiones todavía.</div>
                )}
            </nav>
        </div>
    );
}

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
