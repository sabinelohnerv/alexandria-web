/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchStore } from "@/lib/search/store";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import SystemMessage from "@/components/chat/SystemMessage";
import UserMessage from "@/components/chat/UserMessage";
import MessageComposer from "@/components/chat/MessageComposer";
import AssistantThinking from "@/components/chat/AssistantThinking";
import Image from "next/image";
import { BackendError } from "@/lib/api/errors";
import { useToast } from "@/components/ui/toast/ToastProvider";

function getErrorTitle(error: BackendError): string {
    switch (error.code) {
        case "database_error":
            return "Error de Base de Datos";
        case "connection_error":
            return "Error de Conexión";
        case "timeout_error":
            return "Tiempo de Espera Agotado";
        case "validation_error":
            return "Error de Validación";
        case "content_validation":
            return "Aviso";
        case "not_found":
            return "No Encontrado";
        case "unauthorized":
            return "No Autorizado";
        case "forbidden":
            return "Acceso Denegado";
        default:
            return "Error al Enviar Mensaje";
    }
}

export default function ChatWindow() {
    const { sessions, currentId, messagesBySession, selectSession, sendAsk, loadingSessions } = useSearchStore();
    const toast = useToast();

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
    const [lastQuery, setLastQuery] = useState<string>("");

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
        setLastQuery(content.trim());
        try {
            await sendAsk(currentId, content.trim());
        } catch (e: any) {
            if (e instanceof BackendError) {
                // Determinar el tipo de toast según el error
                const kind = e.getAlertKind() === "error" ? "error" : "info";
                const title = getErrorTitle(e);
                const message = e.getUserMessage();
                
                toast.show({ kind, title, message, duration: 5000 });
            } else {
                toast.error(
                    e?.message || "Hubo un error enviando la consulta. Por favor, intenta de nuevo.",
                    "Error al Enviar Mensaje"
                );
            }
        } finally {
            setSending(false);
        }
    }, [currentId, sendAsk, toast]);

    const handleRetry = useCallback(() => {
        if (lastQuery) {
            void doSend(lastQuery);
        }
    }, [lastQuery, doSend]);

    if (!session) {
        return (
            <section className="flex-1 grid place-items-center p-6">
                <div className="text-center animate-fadeIn">
                    {loadingSessions ? (
                        <>
                            <div className="w-12 h-12 mx-auto mb-4">
                                <svg className="animate-spin text-[var(--brand)]" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                            <p className="text-slate-600 font-medium">Cargando sesiones...</p>
                            <p className="text-sm text-slate-500 mt-1">Por favor espera un momento</p>
                        </>
                    ) : (
                        <>
                            <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p className="text-slate-600 font-medium">No hay sesión seleccionada</p>
                            <p className="text-sm text-slate-500 mt-1">Selecciona o crea una sesión para comenzar</p>
                        </>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="flex-1 h-full min-h-0 flex flex-col">
            {/* Mensajes */}
            <div
                ref={viewRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-8 space-y-3 relative"
            >

                {messages.length === 0 && !sending && (
                    <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white p-8 text-center">
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
            <div className="border-t bg-white p-3 md:p-5">
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
