"use client"

import { useChatStore } from "@/lib/chat/store"
import { useMemo, useRef, useEffect, useState } from "react"

export default function ChatWindow() {
    const { sessions, currentId, addMessage, renameSession } = useChatStore()
    const session = useMemo(() => sessions.find((s) => s.id === currentId), [sessions, currentId])

    const [text, setText] = useState("")
    const viewRef = useRef<HTMLDivElement>(null)
    const messageCount = session?.messages.length ?? 0

    useEffect(() => {
        const el = viewRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messageCount])

    if (!session) {
        return <section className="flex-1 grid place-items-center">No hay chat seleccionado.</section>
    }

    async function onSend() {
        if (!session) return
        const content = text.trim()
        if (!content) return
        setText("")
        addMessage(session.id, { role: "user", content })
        if ((session.messages?.length ?? 0) === 0) renameSession(session.id, content.slice(0, 30))
        setTimeout(() => addMessage(session.id, { role: "assistant", content: "🤖 (demo) Respuesta generada. Luego se implementará Alexandria." }), 400)
    }

    return (
        <section className="flex-1 h-full min-h-0 flex flex-col">
            {/* Mensajes (scroll interno del chat) */}
            <div ref={viewRef} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3">
                {messageCount === 0 && (
                    <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white p-6 text-center">
                        <h3 className="text-lg font-semibold">¡Bienvenido a Alexandria!</h3>
                        <p className="text-sm text-slate-600 mt-1">Escribe tu primera consulta legal abajo.</p>
                    </div>
                )}

                {(session.messages ?? []).map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow ${m.role === "user" ? "text-white" : "border bg-white"
                                }`}
                            style={m.role === "user" ? { background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" } : undefined}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Composer */}
            <div className="border-t bg-white p-3">
                <div className="mx-auto max-w-3xl flex gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 rounded-xl border bg-white p-3 text-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                    />
                    <button
                        onClick={onSend}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60
                       hover:-translate-y-[1px] transition-transform"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                        disabled={!text.trim()}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </section>
    )
}
