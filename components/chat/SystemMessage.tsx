/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import FeedbackHitsDialog from "@/components/feedback/FeedbackHitsDialog";
import { useSearchStore } from "@/lib/search/store";

import MessageShell from "./system/MessageShell";
import CopyButton from "./system/CopyButton";
import Avatar from "./system/Avatar";
import Header from "./system/Header";
import Body from "./system/Body";
import Footer from "./system/Footer";
import { normalize, highlightRefsFenceAware } from "./system/markdown";

type Props = {
    content: string;
    messageId?: number;
    sessionId?: number;
    title?: string;
};

export default function SystemMessage({ content, title, messageId, sessionId }: Props) {
    const original = content;
    const enhanced = highlightRefsFenceAware(normalize(content));

    const feedbackCounts = useSearchStore((s) => s.feedbackCounts);
    const myFeedback = useSearchStore((s) => s.myFeedback);
    const feedbackSubmitting = useSearchStore((s) => s.feedbackSubmitting);
    const toggleFeedback = useSearchStore((s) => s.toggleFeedback);

    const canFeedback =
        typeof messageId === "number" && messageId > 0 &&
        typeof sessionId === "number" && sessionId > 0;

    const counts = canFeedback ? feedbackCounts[messageId!] ?? { useful: 0, not_useful: 0 } : { useful: 0, not_useful: 0 };
    const mine = (canFeedback ? myFeedback[messageId!] ?? null : null) as "useful" | "not_useful" | null;
    const busy = canFeedback ? !!feedbackSubmitting[messageId!] : false;

    const [openDialog, setOpenDialog] = React.useState(false);
    const openHits = () => { if (canFeedback) setOpenDialog(true); };

    const voteAndOpen = async (label: "useful" | "not_useful") => {
        if (!canFeedback) return;
        await toggleFeedback(messageId!, label, sessionId!);
        setOpenDialog(true);
    };

    return (
        <>
            <MessageShell>
                <CopyButton text={original} />

                {/* LADO A LADO: avatar a la izquierda, todo el contenido a la derecha */}
                <div className="flex items-start gap-3">
                    <Avatar />
                    <div className="flex-1 min-w-0">
                        <Header title={title} />
                        <Body content={enhanced} />

                        <Footer
                            onOpenHits={openHits}
                            canFeedback={!!canFeedback}
                            counts={counts}
                            mine={mine}
                            busy={busy}
                            onVoteUseful={() => voteAndOpen("useful")}
                            onVoteNotUseful={() => voteAndOpen("not_useful")}
                        />
                    </div>
                </div>
            </MessageShell>

            {canFeedback && (
                <FeedbackHitsDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    messageId={messageId!}
                    sessionId={sessionId!}
                />
            )}
        </>
    );
}
