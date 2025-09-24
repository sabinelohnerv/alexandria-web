/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ChatSession, ChatMessage } from "@/lib/search/types";
import { listSessions, createSession as apiCreate, renameSession as apiRename, deleteSession as apiDelete, restoreSession as apiRestore, getSession as apiGetSession } from "@/lib/search/sessions";
import { listMessages } from "@/lib/search/messages";
import { ask as apiAsk } from "@/lib/search/ask";

export type UIMessage = { id: number; role: "user" | "assistant" | "system"; content: string; createdAt: string };
function toUIMessage(m: ChatMessage): UIMessage {
    return { id: m.id, role: m.role, content: m.text, createdAt: m.created_at };
}

type SearchState = {
    sessions: Array<{ id: number; title: string; updatedAt: string; isDeleted?: boolean }>;
    currentId: number | null;
    messagesBySession: Record<number, UIMessage[]>;
    loadingSessions: boolean;
    loadingMessages: Record<number, boolean>;
    error?: string | null;

    // actions
    hydrateSessions: () => Promise<void>;
    selectSession: (id: number) => Promise<void>;
    createSession: (title?: string) => Promise<number>;
    renameSession: (id: number, title: string) => Promise<void>;
    deleteSession: (id: number) => Promise<void>;
    restoreSession: (id: number) => Promise<void>;

    addMessage: (sessionId: number, msg: { role: "user" | "assistant" | "system"; content: string }) => void;
    sendAsk: (sessionId: number, query: string) => Promise<void>;
};

export const useSearchStore = create<SearchState>()(devtools((set, get) => ({
    sessions: [],
    currentId: null,
    messagesBySession: {},
    loadingSessions: false,
    loadingMessages: {},
    error: null,

    hydrateSessions: async () => {
        set({ loadingSessions: true, error: null });
        try {
            const page1 = await listSessions();
            const sessions = page1.results.map(s => ({
                id: s.id, title: s.title, updatedAt: s.updated_at, isDeleted: s.is_deleted
            }));
            set({ sessions });
            // si no hay current, selecciona la primera
            if (!get().currentId && sessions.length > 0) {
                await get().selectSession(sessions[0].id);
            }
        } catch (e: any) {
            set({ error: e.message ?? "Error al cargar sesiones" });
        } finally {
            set({ loadingSessions: false });
        }
    },

    selectSession: async (id: number) => {
        set({ currentId: id });
        const has = get().messagesBySession[id];
        if (has && has.length > 0) return; // ya cargado
        set(state => ({ loadingMessages: { ...state.loadingMessages, [id]: true } }));
        try {
            const res = await listMessages(id);
            const msgs = res.results.map(toUIMessage).sort((a, b) => a.id - b.id);
            set(state => ({
                messagesBySession: { ...state.messagesBySession, [id]: msgs }
            }));
            // trae título/updated si quieres asegurar consistencia
            const s = await apiGetSession(id).catch(() => null);
            if (s) {
                set(state => ({
                    sessions: state.sessions.map(x => x.id === id ? ({ id: s.id, title: s.title, updatedAt: s.updated_at, isDeleted: s.is_deleted }) : x)
                }));
            }
        } catch (e: any) {
            set({ error: e.message ?? "Error al cargar mensajes" });
        } finally {
            set(state => ({ loadingMessages: { ...state.loadingMessages, [id]: false } }));
        }
    },

    createSession: async (title?: string) => {
        const created = await apiCreate(title ?? "");
        const s = { id: created.id, title: created.title, updatedAt: created.updated_at, isDeleted: created.is_deleted };
        set(state => ({ sessions: [s, ...state.sessions] }));
        await get().selectSession(created.id);
        return created.id;
    },

    renameSession: async (id: number, title: string) => {
        // optimista
        const prev = get().sessions;
        set({ sessions: prev.map(s => s.id === id ? { ...s, title } : s) });
        try { await apiRename(id, title); }
        catch { set({ sessions: prev }); }
    },

    deleteSession: async (id: number) => {
        await apiDelete(id);
        // quitar de la lista local
        set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));
        if (get().currentId === id) {
            set({ currentId: null });
            // intenta seleccionar otra
            const next = get().sessions[0];
            if (next) await get().selectSession(next.id);
        }
    },

    restoreSession: async (id: number) => {
        const restored = await apiRestore(id);
        // poner al inicio
        set(state => ({
            sessions: [{ id: restored.id, title: restored.title, updatedAt: restored.updated_at, isDeleted: restored.is_deleted }, ...state.sessions.filter(s => s.id !== id)]
        }));
    },

    addMessage: (sessionId, msg) => {
        const ui: UIMessage = { id: -Date.now(), role: msg.role, content: msg.content, createdAt: new Date().toISOString() };
        set(state => ({
            messagesBySession: {
                ...state.messagesBySession,
                [sessionId]: [...(state.messagesBySession[sessionId] ?? []), ui]
            }
        }));
    },

    sendAsk: async (sessionId: number, query: string) => {
        // añade mensaje user optimista
        const tempId = -Date.now();
        const tempUser: UIMessage = { id: tempId, role: "user", content: query, createdAt: new Date().toISOString() };
        set(state => ({
            messagesBySession: {
                ...state.messagesBySession,
                [sessionId]: [...(state.messagesBySession[sessionId] ?? []), tempUser]
            }
        }));

        try {
            const { message } = await apiAsk({ session_id: sessionId, query });
            const assistant = toUIMessage(message);
            set(state => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: (state.messagesBySession[sessionId] ?? [])
                        .filter(m => m.id !== tempId)
                        .concat([tempUser, assistant])
                },
                sessions: state.sessions.map(s =>
                    s.id === sessionId ? { ...s, updatedAt: assistant.createdAt } : s
                )
            }));
            // si era el primer mensaje: renombra con la query (primeros 30 chars)
            const msgs = get().messagesBySession[sessionId] ?? [];
            if (msgs.length <= 2) { // temp user + assistant
                const newTitle = query.slice(0, 30);
                if (newTitle) await get().renameSession(sessionId, newTitle);
            }
        } catch (e) {
            // revert: quita tempUser
            set(state => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: (state.messagesBySession[sessionId] ?? []).filter(m => m.id !== tempId)
                }
            }));
            throw e;
        }
    },
})));
