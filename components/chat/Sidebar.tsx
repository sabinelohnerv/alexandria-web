"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/ui/store";
import { useSearchStore } from "@/lib/search/store"; // <-- nuevo

function SidebarInner() {
    const {
        sessions,
        currentId,
        selectSession,
        createSession,
        renameSession,
        deleteSession,
        hydrateSessions,
    } = useSearchStore();

    // Carga sesiones al montar
    useEffect(() => { void hydrateSessions(); }, [hydrateSessions]);

    // Si no hay sesiones, crea una
    useEffect(() => {
        if (sessions.length === 0) {
            (async () => {
                const id = await createSession("Búsqueda nueva");
                await selectSession(id);
            })();
        }
    }, [sessions.length, createSession, selectSession]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Historial</h2>
                <button
                    type="button"
                    onClick={async () => {
                        const id = await createSession("Búsqueda nueva");
                        await selectSession(id);
                    }}
                    className="rounded-lg px-3 py-1 text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                >
                    Nueva
                </button>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-scroll bg-white divide-y divide-gray-200">
                {sessions.map((s) => {
                    const isActive = currentId === s.id;
                    return (
                        <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectSession(s.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault(); selectSession(s.id);
                                }
                            }}
                            title={new Date(s.updatedAt).toLocaleString()}
                            className={`group relative grid h-16 grid-cols-[1fr_auto] items-center px-3 rounded-none transition-colors
                ${isActive
                                    ? "bg-[#023f661F] ring-2 ring-inset ring-[#023f66] after:absolute after:inset-y-1.5 after:left-0 after:w-1.5 after:bg-[#023f66]"
                                    : "hover:bg-[#023f660D]"
                                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#023f66]`}
                        >
                            <div className="min-w-0">
                                <div className="truncate">{s.title || `(sesión #${s.id})`}</div>
                                <div className="text-[11px] text-slate-500">
                                    {new Date(s.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const name = prompt("Renombrar sesión:", s.title);
                                        if (name) await renameSession(s.id, name);
                                    }}
                                    className="text-xs underline rounded px-1 hover:bg-white"
                                    aria-label="Renombrar"
                                >
                                    Renombrar
                                </button>
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm("¿Eliminar sesión?")) await deleteSession(s.id);
                                    }}
                                    className="text-xs text-red-600 underline rounded px-1 hover:bg-white"
                                    aria-label="Eliminar"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

export default function Sidebar() {
    const { sidebarOpen } = useUIStore();

    return (
        <>
            <aside className="hidden md:flex w-72 shrink-0 flex-col border-r bg-white min-h-0">
                <SidebarInner />
            </aside>
            {sidebarOpen && (
                <div className="fixed top-14 bottom-0 left-0 z-50 w-80 md:hidden bg-white border-r flex flex-col min-h-0">
                    <SidebarInner />
                </div>
            )}
        </>
    );
}
