/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
    listSessions, createSession, renameSession, deleteSession, restoreSession
} from "@/lib/search/sessions";
import type { ChatSession, Paginated } from "@/lib/search/types";

export default function SearchSessionsPage() {
    const [data, setData] = useState<Paginated<ChatSession> | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState("");

    async function load(page?: number) {
        setLoading(true);
        setErr(null);
        try {
            const res = await listSessions();
            setData(res);
        } catch (e: any) {
            setErr(e.message ?? "Error");
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function onCreate() {
        if (!newTitle.trim()) return;
        const created = await createSession(newTitle.trim());
        setNewTitle("");
        setData((d) =>
            d
                ? { ...d, results: [created, ...d.results] }
                : { count: 1, next: null, previous: null, results: [created] }
        );
    }

    async function onRename(s: ChatSession, title: string) {
        const prev = s.title;
        setData((d) => d ? { ...d, results: d.results.map(r => r.id === s.id ? { ...r, title } : r) } : d);
        try { await renameSession(s.id, title); }
        catch {
            setData((d) => d ? { ...d, results: d.results.map(r => r.id === s.id ? { ...r, title: prev } : r) } : d);
        }
    }

    async function onDelete(id: number) {
        try {
            await deleteSession(id);
            setData(d => d ? { ...d, results: d.results.filter(r => r.id !== id) } : d);
        } catch (e: any) {
            alert(e?.message ?? "No se pudo eliminar la sesión.");
        }
    }

    async function onRestore(id: number) {
        const restored = await restoreSession(id);
        setData((d) => d ? { ...d, results: [restored, ...d.results.filter(r => r.id !== id)] } : d);
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Sesiones de búsqueda</h1>

            <div className="flex gap-2">
                <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Título opcional…"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <button onClick={onCreate} className="px-4 py-2 rounded bg-black text-white">
                    Nuevo chat
                </button>
            </div>

            {loading && <div className="opacity-70">Cargando…</div>}
            {err && <div className="text-red-600">{err}</div>}

            <ul className="space-y-3">
                {data?.results.map((s) => (
                    <li key={s.id} className="border rounded p-3 flex items-center gap-3">
                        <input
                            defaultValue={s.title}
                            onBlur={(e) => onRename(s, e.currentTarget.value)}
                            className="flex-1 border rounded px-2 py-1"
                        />
                        {!s.is_deleted ? (
                            <button onClick={() => onDelete(s.id)} className="px-3 py-1 rounded border">Eliminar</button>
                        ) : (
                            <button onClick={() => onRestore(s.id)} className="px-3 py-1 rounded border">Restaurar</button>
                        )}
                    </li>
                ))}
            </ul>

            {data?.next && (
                <div className="text-center">
                    <button
                        onClick={() => {
                            const url = new URL(data.next!, window.location.origin);
                            const page = Number(url.searchParams.get("page") ?? "2");
                            load(page);
                        }}
                        className="px-4 py-2 rounded border"
                    >
                        Cargar más
                    </button>
                </div>
            )}
        </div>
    );
}
