"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"

export type Role = "user" | "assistant"
export interface ChatMessage {
    id: string
    role: Role
    content: string
    createdAt: number
}
export interface ChatSession {
    id: string
    title: string
    createdAt: number
    updatedAt: number
    messages: ChatMessage[]
}

interface ChatState {
    sessions: ChatSession[]
    currentId: string | null
    createSession(title?: string): string
    selectSession(id: string): void
    renameSession(id: string, title: string): void
    deleteSession(id: string): void
    addMessage(sessionId: string, msg: Omit<ChatMessage, "id" | "createdAt">): ChatMessage
    clearAll(): void
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            sessions: [],
            currentId: null,

            createSession(title = "Nuevo chat") {
                const id = nanoid()
                const now = Date.now()
                const session: ChatSession = { id, title, createdAt: now, updatedAt: now, messages: [] }
                set((s) => ({ sessions: [session, ...s.sessions], currentId: id }))
                return id
            },

            selectSession(id) {
                const exists = get().sessions.some((s) => s.id === id)
                if (exists) set({ currentId: id })
            },

            renameSession(id, title) {
                set((s) => ({
                    sessions: s.sessions.map((x) => (x.id === id ? { ...x, title } : x)),
                }))
            },

            deleteSession(id) {
                set((s) => {
                    const sessions = s.sessions.filter((x) => x.id !== id)
                    const currentId = s.currentId === id ? sessions[0]?.id ?? null : s.currentId
                    return { sessions, currentId }
                })
            },

            addMessage(sessionId, msg) {
                const item: ChatMessage = { id: nanoid(), createdAt: Date.now(), ...msg }
                set((s) => ({
                    sessions: s.sessions.map((x) =>
                        x.id === sessionId
                            ? { ...x, messages: [...x.messages, item], updatedAt: Date.now() }
                            : x
                    ),
                }))
                return item
            },

            clearAll() {
                set({ sessions: [], currentId: null })
            },
        }),
        { name: "chat-store-v1" }
    )
)
