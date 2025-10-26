"use client";

import { useSearchStore } from "@/lib/search/store";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import SystemMessage from "@/components/chat/SystemMessage";
import UserMessage from "@/components/chat/UserMessage";
import MessageComposer from "@/components/chat/MessageComposer";
import AssistantThinking from "@/components/chat/AssistantThinking";
import Image from "next/image";

export default function ChatWindow() {
    const { sessions, currentId, messagesBySession, selectSession, sendAsk } = useSearchStore();

    const session = useMemo(
        () => sessions.find((s) => s.id === currentId) || null,
        [sessions, currentId]
    );

    const messages = useMemo(
        () => (currentId ? messagesBySession[currentId] ?? [] : []),
        [messagesBySession, currentId]
    );

    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const viewRef = useRef<HTMLDivElement>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // Auto-scroll al final cuando cambia el conteo de mensajes o el estado "sending"
    useEffect(() => {
        const el = viewRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages.length, sending]);

    useEffect(() => {
        const el = viewRef.current;
        if (!el) return;
        const onScroll = () => {
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
            setShowScrollBtn(!atBottom);
        };
        el.addEventListener("scroll", onScroll);
        onScroll();
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!session && sessions[0]) void selectSession(sessions[0].id);
    }, [session, sessions, selectSession]);

    const doSend = useCallback(async (content: string) => {
        if (!content.trim() || !currentId) return;
        setText("");
        setSending(true);
        try {
            await sendAsk(currentId, content.trim());
        } catch (e) {
            console.error(e);
            alert("Hubo un error enviando la consulta.");
        } finally {
            setSending(false);
        }
    }, [currentId, sendAsk]);

    if (!session) {
        return (
            <section className="flex-1 grid place-items-center">
                No hay sesión seleccionada.
            </section>
        );
    }

    return (
        <section className="flex-1 h-full min-h-0 flex flex-col">
            {/* Mensajes */}
            <div
                ref={viewRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3 relative"
            >
                {messages.length === 0 && !sending && (
                    <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div
                                className="grid place-items-center rounded-full border size-16"
                                style={{ borderColor: "var(--brand)" }}
                            >
                                <Image src="/brand/logo-mark.svg" alt="Alexandria" width={48} height={48} priority />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold">¡Bienvenido a Alexandria!</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            Escribe tu primera consulta legal abajo.
                        </p>
                    </div>
                )}

                {messages.map((m) => {
                    if (m.role === "assistant" || m.role === "system") {
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
                    return <UserMessage key={m.id} content={m.content} />;
                })}

                {/* Placeholder del asistente mientras se procesa */}
                {sending && (
                    <AssistantThinking />
                )}

                {/* Botón: bajar al final */}
                {showScrollBtn && (
                    <button
                        type="button"
                        onClick={() => {
                            const el = viewRef.current;
                            if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
                        }}
                        className="absolute right-4 bottom-4 rounded-full border bg-white/90 backdrop-blur px-3 py-2 text-xs shadow hover:bg-white"
                        title="Bajar al final"
                    >
                        ↓ Final
                    </button>
                )}
            </div>

            {/* Composer */}
            <div className="border-t bg-white p-3">
                <MessageComposer
                    value={text}
                    onChange={setText}
                    onSend={doSend}
                    loading={sending}
                    placeholder="Escribe un mensaje…"
                    className="max-w-3xl"
                />
            </div>
        </section>
    );
}
