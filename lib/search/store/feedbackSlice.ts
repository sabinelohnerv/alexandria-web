/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { FeedbackState, FeedbackLabel, FBCounts, SetFn, GetFn } from "./types";
import { delJson, postJson } from "./http";

export type FeedbackActions = {
    hydrateFromMessages: (rawMessages: any[]) => void;

    toggleFeedback: (messageId: number, label: FeedbackLabel, sessionId?: number) => Promise<void>;
    unvoteFeedback: (messageId: number, sessionId?: number) => Promise<void>;
};

export type FeedbackSlice = FeedbackState & FeedbackActions;

export const feedbackInitialState: FeedbackState = {
    feedbackSubmitting: {},
    myFeedback: {},
    feedbackCounts: {},
};

export function createFeedbackSlice(set: SetFn<FeedbackSlice>, get: GetFn<FeedbackSlice>): FeedbackSlice {
    return {
        ...feedbackInitialState,

        hydrateFromMessages: (rawMessages) => {
            set((state) => {
                const counts = { ...state.feedbackCounts };
                const mine = { ...state.myFeedback };
                for (const m of rawMessages ?? []) {
                    const uid = Number(m.id);
                    counts[uid] = {
                        useful: Number(m.useful_count ?? 0),
                        not_useful: Number(m.not_useful_count ?? 0),
                    };
                    mine[uid] = (m.my_feedback_label ?? null) as FeedbackLabel | null;
                }
                return { feedbackCounts: counts, myFeedback: mine };
            });
        },

        // /search/feedback/ (POST) y /search/feedback/?message_id=ID (DELETE)
        toggleFeedback: async (messageId, label) => {
            const st = get();
            const current = st.myFeedback[messageId] ?? null;

            const prevMine = { ...st.myFeedback };
            const prevCounts = { ...st.feedbackCounts };
            const curCounts = prevCounts[messageId] ?? { useful: 0, not_useful: 0 };
            let nextMine: FeedbackLabel | null = label;
            const nextCounts: FBCounts = { ...curCounts };

            const unvoting = current === label;

            if (unvoting) {
                nextMine = null;
                if (label === "useful" && nextCounts.useful > 0) nextCounts.useful -= 1;
                if (label === "not_useful" && nextCounts.not_useful > 0) nextCounts.not_useful -= 1;
            } else {
                if (label === "useful") {
                    nextCounts.useful += 1;
                    if (current === "not_useful" && nextCounts.not_useful > 0) nextCounts.not_useful -= 1;
                } else {
                    nextCounts.not_useful += 1;
                    if (current === "useful" && nextCounts.useful > 0) nextCounts.useful -= 1;
                }
            }

            set((s) => ({
                myFeedback: { ...s.myFeedback, [messageId]: nextMine },
                feedbackCounts: { ...s.feedbackCounts, [messageId]: nextCounts },
                feedbackSubmitting: { ...s.feedbackSubmitting, [messageId]: true },
            }));

            try {
                if (unvoting) {
                    await delJson(`search/feedback/?message_id=${messageId}`);
                } else {
                    await postJson(`search/feedback/`, { message: messageId, label });
                }
            } catch (e) {
                set({ myFeedback: prevMine, feedbackCounts: prevCounts });
                throw e;
            } finally {
                set((s) => {
                    const { [messageId]: _b, ...rest } = s.feedbackSubmitting;
                    return { feedbackSubmitting: rest };
                });
            }
        },

        unvoteFeedback: async (messageId) => {
            const st = get();
            const current = st.myFeedback[messageId] ?? null;
            if (!current) return;

            const prevMine = { ...st.myFeedback };
            const prevCounts = { ...st.feedbackCounts };
            const curCounts = prevCounts[messageId] ?? { useful: 0, not_useful: 0 };
            const nextCounts: FBCounts = { ...curCounts };

            if (current === "useful" && nextCounts.useful > 0) nextCounts.useful -= 1;
            if (current === "not_useful" && nextCounts.not_useful > 0) nextCounts.not_useful -= 1;

            set((s) => ({
                myFeedback: { ...s.myFeedback, [messageId]: null },
                feedbackCounts: { ...s.feedbackCounts, [messageId]: nextCounts },
                feedbackSubmitting: { ...s.feedbackSubmitting, [messageId]: true },
            }));

            try {
                await delJson(`search/feedback/?message_id=${messageId}`);
            } catch (e) {
                set({ myFeedback: prevMine, feedbackCounts: prevCounts });
                throw e;
            } finally {
                set((s) => {
                    const { [messageId]: _b, ...rest } = s.feedbackSubmitting;
                    return { feedbackSubmitting: rest };
                });
            }
        },
    };
}
