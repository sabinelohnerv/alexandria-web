/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { listMessages } from "@/lib/search/messages";
import { ask } from "@/lib/search/ask";
import { renameSession, deleteSession, restoreSession } from "@/lib/search/sessions";
import type { ChatMessage, SearchHit } from "@/lib/search/types";

export default function SearchSessionDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const sessionId = useMemo(() => Number(params.id), [params.id]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hitsByMsg, setHitsByMsg] = useState<Record<number, SearchHit[]>>({});
    const [title, setTitle] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!Number.isFinite(sessionId)) return;
        (async () => {
            setLoading(true); setErr(null);
            try {
                const page1 = await listMessages(sessionId);
                setMessages(page1.results.sort((a, b) => a.id - b.id));
                // Si tu backend devuelve el título en otro endpoint, ignora esto.
                // Podrías traerlo desde /search/sessions/{id}/ si lo prefieres.
            } catch (e: any) {
                setErr(e.message ?? "Error");
            } finally {
                setLoading(false);
            }
        })();
    }, [sessionId]);

    async function onSend() {
        const text = query.trim();
        if (!text) return;

        // Mensaje del usuario (optimista)
        const tempUser: ChatMessage = {
            id: -Date.now(),
            session: sessionId,
            role: "user",
            text,
            created_at: new Date().toISOString(),
            answer_json: null,
            latency_ms: null,
            useful_count: 0,
            not_useful_count: 0,
            my_feedback_label: null
        };
        setMessages((m) => [...m, tempUser]);
        setQuery("");

        try {
            const { message, hits } = await ask({ session_id: sessionId, query: text });
            // reemplaza el temporal si quieres; aquí lo dejamos y agregamos la respuesta
            setMessages((m) => [...m.filter(x => x.id !== tempUser.id), tempUser, message]);
            setHitsByMsg((prev) => ({ ...prev, [message.id]: hits }));
            // scroll al final
            setTimeout(() => inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
        } catch (e: any) {
            setErr(e.message ?? "Error");
            // revertir el temporal si quieres:
            setMessages((m) => m.filter(x => x.id !== tempUser.id));
        }
    }

    async function onRename() {
        const t = title.trim();
        if (!t) return;
        try { await renameSession(sessionId, t); }
        catch (e) { console.error(e); }
    }

    async function onDelete() {
        try { await deleteSession(sessionId); router.push("/search"); }
        catch (e) { console.error(e); }
    }

    async function onRestore() {
        try { await restoreSession(sessionId); }
        catch (e) { console.error(e); }
    }

    return (
        <div className="mx-auto max-w-4xl p-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/search" className="text-sm underline">← Volver</Link>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={onRename}
                        placeholder="Título de la sesión"
                        className="border rounded px-3 py-2 min-w-[16rem]"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={onDelete} className="px-3 py-1 rounded border">Eliminar</button>
                    <button onClick={onRestore} className="px-3 py-1 rounded border">Restaurar</button>
                </div>
            </div>

            {loading && <div className="opacity-70">Cargando…</div>}
            {err && <div className="text-red-600">{err}</div>}

            <div className="space-y-4 border rounded p-4 min-h-[40vh]">
                {messages.map((m) => (
                    <div key={m.id} className="space-y-2">
                        <div className={`px-3 py-2 rounded ${m.role === "user" ? "bg-gray-100" : "bg-white border"}`}>
                            <div className="text-xs opacity-60">{m.role} • {new Date(m.created_at).toLocaleString()}</div>
                            <div className="whitespace-pre-wrap">{m.text}</div>
                        </div>

                        {/* Preview de hits, solo para respuestas del assistant */}
                        {m.role !== "user" && hitsByMsg[m.id] && hitsByMsg[m.id].length > 0 && (
                            <div className="pl-3">
                                <div className="text-xs font-medium mb-1">Fuentes (top 3)</div>
                                <ul className="list-disc pl-6">
                                    {hitsByMsg[m.id].slice(0, 3).map((h) => (
                                        <li key={h.id} className="text-sm opacity-80">
                                            doc {h.document_id} · chunk {h.chunk_id} · r={h.rank} · score={h.score_vector.toFixed(3)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={inputRef} />
            </div>

            <div className="flex gap-2">
                <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Escribe tu consulta…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                />
                <button onClick={onSend} className="px-4 py-2 rounded bg-black text-white">
                    Enviar
                </button>
            </div>
        </div>
    );
}
