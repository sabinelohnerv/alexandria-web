/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChatMessage } from "@/lib/search/types";
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

export type UIMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

function toUIMessage(m: ChatMessage): UIMessage {
  return { id: m.id, role: m.role, content: m.text, createdAt: m.created_at };
}

/** id temporal negativo para borradores (evita colisiones con ids reales del backend) */
let draftSeq = 1;
function nextDraftId() {
  return -draftSeq++;
}

type UISession = {
  id: number;
  title: string;
  updatedAt: string;
  isDeleted?: boolean;
  /** true si solo existe en frontend (no creada aún en backend) */
  isLocal?: boolean;
};

type SearchState = {
  sessions: UISession[];
  currentId: number | null;
  messagesBySession: Record<number, UIMessage[]>;
  loadingSessions: boolean;
  loadingMessages: Record<number, boolean>;
  error?: string | null;

  // carga inicial
  hydrateSessions: () => Promise<void>;

  // navegación
  selectSession: (id: number) => Promise<void>;
  /** crea borrador local sin golpear backend */
  startDraftSession: (title?: string) => number;
  /** asegura que haya un borrador seleccionado; si no existe, lo crea */
  ensureDraft: (title?: string) => number;
  /** descarta un borrador si no tiene mensajes (se usa al cambiar de sesión) */
  discardIfEmptyDraft: (id: number) => void;

  // CRUD título/estado
  renameSession: (id: number, title: string) => Promise<void>;
  deleteSession: (id: number) => Promise<void>;
  restoreSession: (id: number) => Promise<void>;

  // mensajería
  addMessage: (sessionId: number, msg: { role: "user" | "assistant" | "system"; content: string }) => void;
  /** si la sesión es local, la crea en backend y migra el estado antes de preguntar */
  sendAsk: (sessionId: number, query: string) => Promise<void>;
};

export const useSearchStore = create<SearchState>()(
  devtools((set, get) => ({
    sessions: [],
    currentId: null,
    messagesBySession: {},
    loadingSessions: false,
    loadingMessages: {},
    error: null,

    // =========================
    // HIDRATACIÓN INICIAL
    // =========================
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

        // si no hay current seleccionado, toma el primero (real)
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

    // =========================
    // BORRADORES LOCALES
    // =========================
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

    // =========================
    // NAVEGACIÓN DE SESIONES
    // =========================
    selectSession: async (id: number) => {
      const prev = get().currentId;
      // si salimos de un borrador vacío, descártalo
      if (prev && prev !== id) {
        get().discardIfEmptyDraft(prev);
      }

      set({ currentId: id });

      // si la sesión es local, no hay nada que cargar
      const isLocal = get().sessions.find((s) => s.id === id)?.isLocal;
      if (isLocal) return;

      // lazy-load de mensajes si no están
      const has = get().messagesBySession[id];
      if (has && has.length > 0) return;

      set((state) => ({ loadingMessages: { ...state.loadingMessages, [id]: true } }));
      try {
        const res = await listMessages(id);
        const msgs = res.results.map(toUIMessage).sort((a, b) => a.id - b.id);
        set((state) => ({
          messagesBySession: { ...state.messagesBySession, [id]: msgs },
        }));

        // refresca metadatos de la sesión (opcional)
        const ss = await apiGetSession(id).catch(() => null);
        if (ss) {
          set((state) => ({
            sessions: state.sessions.map((x) =>
              x.id === id
                ? {
                  id: ss.id,
                  title: ss.title,
                  updatedAt: ss.updated_at,
                  isDeleted: ss.is_deleted,
                  isLocal: false,
                }
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

    // =========================
    // CRUD TÍTULO/ESTADO
    // =========================
    renameSession: async (id: number, title: string) => {
      const sess = get().sessions.find((s) => s.id === id);
      if (!sess) return;

      // Optimista
      const prev = get().sessions;
      set({ sessions: prev.map((s) => (s.id === id ? { ...s, title } : s)) });

      // si es local, no tocamos backend
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

      // borrar borrador local
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
          {
            id: restored.id,
            title: restored.title,
            updatedAt: restored.updated_at,
            isDeleted: restored.is_deleted,
            isLocal: false,
          },
          ...state.sessions.filter((s) => s.id !== id),
        ],
      }));
    },

    // =========================
    // MENSAJERÍA
    // =========================
    addMessage: (sessionId, msg) => {
      const ui: UIMessage = {
        id: -Date.now(),
        role: msg.role,
        content: msg.content,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: [...(state.messagesBySession[sessionId] ?? []), ui],
        },
      }));
    },

    /** Si la sesión es local, la crea en backend y migra el estado antes de pedir respuesta */
    sendAsk: async (sessionId: number, query: string) => {
      const state = get();
      const sess = state.sessions.find((s) => s.id === sessionId);
      if (!sess) throw new Error("Sesión no encontrada");

      let realId = sessionId;

      // 1) materializar borrador en backend
      if (sess.isLocal) {
        const created = await apiCreate(sess.title || query.slice(0, 30));
        const draftMsgs = state.messagesBySession[sessionId] ?? [];

        // Cambia id de la sesión y migra mensajes al id real
        set((s) => ({
          sessions: s.sessions
            .map((x) =>
              x.id === sessionId
                ? {
                  id: created.id,
                  title: created.title,
                  updatedAt: created.updated_at,
                  isDeleted: created.is_deleted,
                  isLocal: false,
                }
                : x
            )
            // evitar duplicados si por alguna razón ya existiera el id real
            .filter((v, i, a) => a.findIndex((w) => w.id === v.id) === i),
          currentId: created.id,
          messagesBySession: { ...s.messagesBySession, [created.id]: draftMsgs },
        }));
        // Limpia contenedor antiguo
        set((s) => {
           
          const { [sessionId]: _drop, ...rest } = s.messagesBySession;
          return { messagesBySession: rest };
        });

        realId = created.id;
      }

      // 2) añade mensaje user optimista
      const tempId = -Date.now();
      const tempUser: UIMessage = {
        id: tempId,
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({
        messagesBySession: {
          ...s.messagesBySession,
          [realId]: [...(s.messagesBySession[realId] ?? []), tempUser],
        },
      }));

      // 3) llama backend
      try {
        const { message } = await apiAsk({ session_id: realId, query });
        const assistant = toUIMessage(message);
        set((s) => ({
          messagesBySession: {
            ...s.messagesBySession,
            [realId]: (s.messagesBySession[realId] ?? [])
              .filter((m) => m.id !== tempId)
              .concat([tempUser, assistant]),
          },
          sessions: s.sessions.map((x) =>
            x.id === realId ? { ...x, updatedAt: assistant.createdAt } : x
          ),
        }));

        // Si era el primer intercambio, renombra con el inicio de la consulta (no bloqueante)
        const msgs = get().messagesBySession[realId] ?? [];
        if (msgs.length <= 2) {
          const newTitle = query.slice(0, 30);
          if (newTitle) void get().renameSession(realId, newTitle);
        }
      } catch (e) {
        // revert: quita tempUser
        set((s) => ({
          messagesBySession: {
            ...s.messagesBySession,
            [realId]: (s.messagesBySession[realId] ?? []).filter((m) => m.id !== tempId),
          },
        }));
        throw e;
      }
    },
  }))
);
