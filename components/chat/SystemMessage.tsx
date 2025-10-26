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
    linkifyRefsFenceAware,
    type RefResolveResult,
    fixMalformedRefsFenceAware,
} from "./system/markdown";

import {
    fetchMessageHits,
    getHitFileUrl,
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

    // 1) Normaliza -> corrige refs mal formadas -> coloca SLOT de fuentes
    const normalized = normalize(content);
    const refsFixed = fixMalformedRefsFenceAware(normalized);           // <-- nuevo
    const withSlot = replaceSourcesSectionFenceAware(refsFixed, SOURCES_SLOT);


    // 2) Estado: markdown final
    const [finalMd, setFinalMd] = React.useState<string>(withSlot);

    // 3) Traer hits, construir resolver por IDs y aplicar transformaciones
    React.useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!canFeedback) {
                if (!cancelled) setFinalMd((prev) => prev.replace(SOURCES_SLOT, ""));
                return;
            }
            try {
                const hits: SearchHitDTO[] = await fetchMessageHits(sessionId!, messageId!, {
                    includeSnippet: false,
                    limit: 50,
                });

                // a) Construir bloque de Fuentes
                const block = buildSourcesSectionMarkdown(hits, sessionId!, messageId!, {
                    includeSnippet: false,
                    numbered: false,
                });

                // b) Construir resolver por IDs (docId:chunkId y docId:hitId)
                // Preindexamos para O(1)
                const byDocChunk = new Map<string, RefResolveResult>();
                const byDocHit = new Map<string, RefResolveResult>();

                for (const h of hits) {
                    const docId = h.document?.id;
                    const hitId = h.id;
                    const chunkId = h.chunk?.id;
                    const authority = (h.document?.authority ?? "").trim();
                    const number = (h.document?.number ?? "").trim();
                    const label = [authority, number ? `Nº ${number}` : ""].filter(Boolean).join(" ") || `Nº ${hitId}`;
                    const href = getHitFileUrl(sessionId!, messageId!, hitId);
                    if (typeof docId === "number") {
                        if (typeof chunkId === "number") {
                            byDocChunk.set(`${docId}:${chunkId}`, { label, href });
                        }
                        byDocHit.set(`${docId}:${hitId}`, { label, href });
                    }
                }

                const resolver = (docId: number, secondId: number): RefResolveResult => {
                    const k1 = `${docId}:${secondId}`;
                    return byDocChunk.get(k1) || byDocHit.get(k1) || null;
                };

                if (!cancelled) {
                    setFinalMd((prev) => {
                        const fixed = fixMalformedRefsFenceAware(prev);
                        const linked = linkifyRefsFenceAware(fixed, resolver);
                        if (linked.includes(SOURCES_SLOT)) return linked.replace(SOURCES_SLOT, block);
                        return linked + (block ? `\n\n${block}` : "");
                    });
                }
            } catch {
                if (!cancelled) setFinalMd((prev) => prev.replace(SOURCES_SLOT, ""));
            }
        }

        run();
        return () => { cancelled = true; };
    }, [canFeedback, sessionId, messageId, withSlot]);

    // 4) Post-proceso: refs fence-aware (queda por si llegan refs no linkificadas)
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
