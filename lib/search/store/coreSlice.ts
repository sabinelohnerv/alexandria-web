/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { CoreState, SetFn, GetFn, UIMessage, UISession } from "./types";
import { toUIMessage } from "./types";
import { nextDraftId } from "./utils";

import {
    listSessions,
    createSession as apiCreate,
    renameSession as apiRename,
    deleteSession as apiDelete,
    restoreSession as apiRestore,
    getSession as apiGetSession,
} from "@/lib/search/sessions";
import { listMessages } from "@/lib/search/messages";
import { ask as apiAsk } from "@/lib/search/ask";

export type CoreActions = {
    hydrateSessions: () => Promise<void>;
    selectSession: (id: number) => Promise<void>;

    startDraftSession: (title?: string) => number;
    ensureDraft: (title?: string) => number;
    discardIfEmptyDraft: (id: number) => void;

    renameSession: (id: number, title: string) => Promise<void>;
    deleteSession: (id: number) => Promise<void>;
    restoreSession: (id: number) => Promise<void>;

    addMessage: (sessionId: number, msg: { role: "user" | "assistant" | "system"; content: string }) => void;
    sendAsk: (sessionId: number, query: string) => Promise<void>;
};

export type CoreSlice = CoreState & CoreActions;

export const coreInitialState: CoreState = {
    sessions: [],
    currentId: null,
    messagesBySession: {},
    loadingSessions: false,
    loadingMessages: {},
    error: null,
};

export function createCoreSlice(set: SetFn<CoreSlice>, get: GetFn<CoreSlice>): CoreSlice {
    return {
        ...coreInitialState,

        // ---- HIDRATACIÓN
        hydrateSessions: async () => {
            set({ loadingSessions: true, error: null });
            try {
                const page1 = await listSessions();
                const sessions: UISession[] = page1.results.map((s) => ({
                    id: s.id,
                    title: s.title,
                    updatedAt: s.updated_at,
                    isDeleted: s.is_deleted,
                    isLocal: false,
                }));
                set({ sessions });

                const cur = get().currentId;
                if (!cur && sessions.length > 0) {
                    set({ currentId: sessions[0].id });
                    void get().selectSession(sessions[0].id);
                }
            } catch (e: any) {
                set({ error: e.message ?? "Error al cargar sesiones" });
            } finally {
                set({ loadingSessions: false });
            }
        },

        // ---- BORRADORES LOCALES
        startDraftSession: (title = "Búsqueda nueva") => {
            const id = nextDraftId();
            const now = new Date().toISOString();
            const draft: UISession = { id, title, updatedAt: now, isLocal: true };
            set((state) => ({
                sessions: [draft, ...state.sessions],
                currentId: id,
                messagesBySession: { ...state.messagesBySession, [id]: [] },
            }));
            return id;
        },

        ensureDraft: (title = "Búsqueda nueva") => {
            const st = get();
            const existing = st.sessions.find((s) => s.isLocal);
            if (existing) {
                set({ currentId: existing.id });
                return existing.id;
            }
            return get().startDraftSession(title);
        },

        discardIfEmptyDraft: (id: number) => {
            const st = get();
            const s = st.sessions.find((x) => x.id === id);
            if (!s?.isLocal) return;
            const msgs = st.messagesBySession[id] ?? [];
            if (msgs.length > 0) return;

            set((state) => {
                const { [id]: _, ...restMsgs } = state.messagesBySession;
                return {
                    sessions: state.sessions.filter((x) => x.id !== id),
                    messagesBySession: restMsgs,
                    currentId: state.currentId === id ? null : state.currentId,
                };
            });
        },

        // ---- NAVEGACIÓN / CARGA MENSAJES
        selectSession: async (id: number) => {
            const prev = get().currentId;
            if (prev && prev !== id) get().discardIfEmptyDraft(prev);

            set({ currentId: id });

            const isLocal = get().sessions.find((s) => s.id === id)?.isLocal;
            if (isLocal) return;

            const has = get().messagesBySession[id];
            if (has && has.length > 0) return;

            set((state) => ({ loadingMessages: { ...state.loadingMessages, [id]: true } }));
            try {
                const res = await listMessages(id);
                const msgs = res.results.map(toUIMessage).sort((a, b) => a.id - b.id);
                set((state) => ({ messagesBySession: { ...state.messagesBySession, [id]: msgs } }));

                const ss = await apiGetSession(id).catch(() => null);
                if (ss) {
                    set((state) => ({
                        sessions: state.sessions.map((x) =>
                            x.id === id
                                ? { id: ss.id, title: ss.title, updatedAt: ss.updated_at, isDeleted: ss.is_deleted, isLocal: false }
                                : x
                        ),
                    }));
                }

            } catch (e: any) {
                set({ error: e.message ?? "Error al cargar mensajes" });
            } finally {
                set((state) => ({ loadingMessages: { ...state.loadingMessages, [id]: false } }));
            }
        },

        // ---- CRUD Sesión
        renameSession: async (id: number, title: string) => {
            const sess = get().sessions.find((s) => s.id === id);
            if (!sess) return;

            const prev = get().sessions;
            set({ sessions: prev.map((s) => (s.id === id ? { ...s, title } : s)) });

            if (sess.isLocal) return;

            try {
                await apiRename(id, title);
            } catch {
                set({ sessions: prev });
            }
        },

        deleteSession: async (id: number) => {
            const sess = get().sessions.find((s) => s.id === id);
            if (!sess) return;

            if (sess.isLocal) {
                set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
                if (get().currentId === id) set({ currentId: null });
                return;
            }

            await apiDelete(id);
            set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
            if (get().currentId === id) {
                set({ currentId: null });
                const next = get().sessions.find((x) => x.id !== id);
                if (next) await get().selectSession(next.id);
            }
        },

        restoreSession: async (id: number) => {
            const restored = await apiRestore(id);
            set((state) => ({
                sessions: [
                    { id: restored.id, title: restored.title, updatedAt: restored.updated_at, isDeleted: restored.is_deleted, isLocal: false },
                    ...state.sessions.filter((s) => s.id !== id),
                ],
            }));
        },

        // ---- Mensajería
        addMessage: (sessionId, msg) => {
            const ui: UIMessage = { id: -Date.now(), role: msg.role, content: msg.content, createdAt: new Date().toISOString() };
            set((state) => ({
                messagesBySession: {
                    ...state.messagesBySession,
                    [sessionId]: [...(state.messagesBySession[sessionId] ?? []), ui],
                },
            }));
        },

        sendAsk: async (sessionId: number, query: string) => {
            const state = get();
            const sess = state.sessions.find((s) => s.id === sessionId);
            if (!sess) throw new Error("Sesión no encontrada");

            let realId = sessionId;

            if (sess.isLocal) {
                const created = await apiCreate(sess.title || query.slice(0, 30));
                const draftMsgs = state.messagesBySession[sessionId] ?? [];

                set((s) => ({
                    sessions: s.sessions
                        .map((x) =>
                            x.id === sessionId
                                ? { id: created.id, title: created.title, updatedAt: created.updated_at, isDeleted: created.is_deleted, isLocal: false }
                                : x
                        )
                        .filter((v, i, a) => a.findIndex((w) => w.id === v.id) === i),
                    currentId: created.id,
                    messagesBySession: { ...s.messagesBySession, [created.id]: draftMsgs },
                }));
                set((s) => {
                    const { [sessionId]: _drop, ...rest } = s.messagesBySession;
                    return { messagesBySession: rest };
                });

                realId = created.id;
            }

            const tempId = -Date.now();
            const tempUser: UIMessage = { id: tempId, role: "user", content: query, createdAt: new Date().toISOString() };
            set((s) => ({
                messagesBySession: { ...s.messagesBySession, [realId]: [...(s.messagesBySession[realId] ?? []), tempUser] },
            }));

            try {
                const { message } = await apiAsk({ session_id: realId, query });
                const assistant = toUIMessage(message);
                set((s) => ({
                    messagesBySession: {
                        ...s.messagesBySession,
                        [realId]: (s.messagesBySession[realId] ?? []).filter((m) => m.id !== tempId).concat([tempUser, assistant]),
                    },
                    sessions: s.sessions.map((x) => (x.id === realId ? { ...x, updatedAt: assistant.createdAt } : x)),
                }));

                const msgs = get().messagesBySession[realId] ?? [];
                if (msgs.length <= 2) {
                    const newTitle = query.slice(0, 30);
                    if (newTitle) void get().renameSession(realId, newTitle);
                }
            } catch (e) {
                set((s) => ({
                    messagesBySession: { ...s.messagesBySession, [realId]: (s.messagesBySession[realId] ?? []).filter((m) => m.id !== tempId) },
                }));
                throw e;
            }
        },
    };
}
