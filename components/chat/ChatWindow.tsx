"use client";

import { useSearchStore } from "@/lib/search/store";
import { useMemo, useRef, useEffect, useState } from "react";
import SystemMessage from "@/components/chat/SystemMessage";
import UserMessage from "@/components/chat/UserMessage";

export default function ChatWindow() {
    const { sessions, currentId, messagesBySession, selectSession, sendAsk } =
        useSearchStore();

    const session = useMemo(
        () => sessions.find((s) => s.id === currentId) || null,
        [sessions, currentId]
    );

    const messages = useMemo(
        () => (currentId ? messagesBySession[currentId] ?? [] : []),
        [messagesBySession, currentId]
    );

    const [text, setText] = useState("");
    const viewRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al final cuando cambia la cantidad
    useEffect(() => {
        const el = viewRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages.length]);

    // Asegurar selección inicial
    useEffect(() => {
        if (!session && sessions[0]) void selectSession(sessions[0].id);
    }, [session, sessions, selectSession]);

    if (!session) {
        return (
            <section className="flex-1 grid place-items-center">
                No hay sesión seleccionada.
            </section>
        );
    }

    async function onSend() {
        const content = text.trim();
        if (!content || !currentId) return;

        setText("");

        try {
            await sendAsk(currentId, content);
        } catch (e) {
            console.error(e);
            alert("Hubo un error enviando la consulta.");
        }
    }

    return (
        <section className="flex-1 h-full min-h-0 flex flex-col">
            {/* Mensajes */}
            <div
                ref={viewRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3"
            >
                {messages.length === 0 && (
                    <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white p-6 text-center">
                        <h3 className="text-lg font-semibold">¡Bienvenido a Alexandria!</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            Escribe tu primera consulta legal abajo.
                        </p>
                    </div>
                )}

                {messages.map((m) => {
                    if (m.role === "assistant" || m.role === "system") {
                        // Los mensajes del asistente/sistema vienen del backend -> id > 0
                        return (
                            <div key={m.id} className="flex justify-start">
                                <SystemMessage
                                    content={m.content}
                                    messageId={m.id}
                                    sessionId={currentId ?? undefined}
                                />
                            </div>
                        );
                    }

                    // Usuario
                    return <UserMessage key={m.id} content={m.content} />;
                })}
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
                        style={{
                            background:
                                "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)",
                        }}
                        disabled={!text.trim()}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </section>
    );
}
