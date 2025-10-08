/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { CoreSlice } from "./coreSlice";
import { createCoreSlice } from "./coreSlice";

import type { FeedbackSlice } from "./feedbackSlice";
import { createFeedbackSlice } from "./feedbackSlice";

import { listMessages } from "@/lib/search/messages";
import { toUIMessage } from "./types";

/** Estado/agregado total del store */
export type SearchStore = CoreSlice & FeedbackSlice;

/** fábrica de store con slices */
export const useSearchStore = create<SearchStore>()(
    devtools((set, get) => {
        const core = createCoreSlice(set as any, get as any);
        const fb = createFeedbackSlice(set as any, get as any);

        const originalSelect = core.selectSession;
        core.selectSession = async (id: number) => {
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

                get().hydrateFromMessages(res.results);

                await (originalSelect as any)(id);
            } finally {
                set((state) => ({ loadingMessages: { ...state.loadingMessages, [id]: false } }));
            }
        };

        return {
            ...core,
            ...fb,
        } as SearchStore;
    })
);
