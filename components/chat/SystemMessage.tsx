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

import {
    normalize,
    highlightRefsFenceAware,
    replaceSourcesSectionFenceAware,
    SOURCES_SLOT,
} from "./system/markdown";

import {
    fetchMessageHits,
    type SearchHitDTO,
} from "@/lib/search/hits";

import { buildSourcesSectionMarkdown } from "./system/SourcesSection";

type Props = {
    content: string;
    messageId?: number;
    sessionId?: number;
    title?: string;
};

export default function SystemMessage({ content, title, messageId, sessionId }: Props) {
    const canFeedback =
        typeof messageId === "number" && messageId > 0 &&
        typeof sessionId === "number" && sessionId > 0;

    // 1) Normaliza y deja un SLOT donde estaba “Fuentes/Referencias/Bibliografía…”
    const normalized = normalize(content);
    const withSlot = replaceSourcesSectionFenceAware(normalized, SOURCES_SLOT);

    // 2) Estado: markdown final (se completa cuando lleguen los hits)
    const [finalMd, setFinalMd] = React.useState<string>(withSlot);

    // 3) Traer hits e inyectar sección desde el helper externo
    React.useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!canFeedback) {
                if (!cancelled) setFinalMd((prev) => prev.replace(SOURCES_SLOT, ""));
                return;
            }
            try {
                const hits: SearchHitDTO[] = await fetchMessageHits(sessionId!, messageId!, {
                    includeSnippet: false, // cambia a true si quieres mostrar snippets
                    limit: 12,
                });

                const block = buildSourcesSectionMarkdown(hits, sessionId!, messageId!, {
                    includeSnippet: false, numbered: false
                });

                if (!cancelled) {
                    setFinalMd((prev) => {
                        if (prev.includes(SOURCES_SLOT)) return prev.replace(SOURCES_SLOT, block);
                        return prev + (block ? `\n\n${block}` : "");
                    });
                }
            } catch {
                if (!cancelled) setFinalMd((prev) => prev.replace(SOURCES_SLOT, ""));
            }
        }

        run();
        return () => { cancelled = true; };
    }, [canFeedback, sessionId, messageId, withSlot]);

    // 4) Post-proceso: refs fence-aware (después de inyectar fuentes)
    const enhanced = highlightRefsFenceAware(finalMd);

    // ===== Feedback store (igual) =====
    const feedbackCounts = useSearchStore((s) => s.feedbackCounts);
    const myFeedback = useSearchStore((s) => s.myFeedback);
    const feedbackSubmitting = useSearchStore((s) => s.feedbackSubmitting);
    const toggleFeedback = useSearchStore((s) => s.toggleFeedback);

    const counts = canFeedback ? feedbackCounts[messageId!] ?? { useful: 0, not_useful: 0 } : { useful: 0, not_useful: 0 };
    const mine = (canFeedback ? myFeedback[messageId!] ?? null : null) as "useful" | "not_useful" | null;
    const busy = canFeedback ? !!feedbackSubmitting[messageId!] : false;

    const [openDialog, setOpenDialog] = React.useState(false);
    const openHits = () => { if (canFeedback) setOpenDialog(true); };

    const voteAndOpen = async (label: "useful" | "not_useful") => {
        if (!canFeedback) return;
        try {
            await toggleFeedback(messageId!, label, sessionId!);
        } finally {
            setOpenDialog(true);
        }
    };

    return (
        <>
            <MessageShell>
                {/* Copia el markdown final, ya con la sección de fuentes inyectada */}
                <CopyButton text={finalMd} />

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
