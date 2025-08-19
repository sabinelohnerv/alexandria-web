"use client"

import { useChatStore } from "@/lib/chat/store"
import { useUIStore } from "@/lib/ui/store"
import { useEffect } from "react"

function SidebarInner() {
    const {
        sessions,
        currentId,
        selectSession,
        createSession,
        renameSession,
        deleteSession,
    } = useChatStore()

    useEffect(() => {
        if (sessions.length === 0) createSession("Chat nuevo")
    }, [sessions.length, createSession])

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Historial</h2>
                <button
                    type="button"
                    onClick={() => createSession("Chat nuevo")}
                    className="rounded-lg px-3 py-1 text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                >
                    Nuevo chat
                </button>
            </div>

            {/* Lista: flush + cuadricular + scrollbar propio */}
            <nav className="flex-1 min-h-0 overflow-y-scroll bg-white divide-y divide-gray-200">
                {sessions.map((s) => {
                    const isActive = currentId === s.id
                    return (
                        <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectSession(s.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    selectSession(s.id)
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
                            {/* Columna izquierda */}
                            <div className="min-w-0">
                                <div className="truncate">{s.title}</div>
                                <div className="text-[11px] text-slate-500">
                                    {new Date(s.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Acciones (solo hover/focus) */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const name = prompt("Renombrar chat:", s.title)
                                        if (name) renameSession(s.id, name)
                                    }}
                                    className="text-xs underline rounded px-1 hover:bg-white"
                                    aria-label="Renombrar chat"
                                >
                                    Renombrar
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm("¿Eliminar chat?")) deleteSession(s.id)
                                    }}
                                    className="text-xs text-red-600 underline rounded px-1 hover:bg-white"
                                    aria-label="Eliminar chat"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}

export default function Sidebar() {
    const { sidebarOpen } = useUIStore()

    return (
        <>
            {/* Desktop: ancho fijo, sin afectar el alto del chat */}
            <aside className="hidden md:flex w-72 shrink-0 flex-col border-r bg-white min-h-0">
                <SidebarInner />
            </aside>

            {/* Mobile: panel fijo BLANCO, debajo de la topbar */}
            {sidebarOpen && (
                <div className="fixed top-14 bottom-0 left-0 z-50 w-80 md:hidden bg-white border-r flex flex-col min-h-0">
                    <SidebarInner />
                </div>
            )}
        </>
    )
}
