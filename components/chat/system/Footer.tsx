"use client";
import React from "react";
import BarButton from "./BarButton";
import { ThumbUp, ThumbDown, IconResults } from "./Icons";

type Props = {
    // control de hits
    onOpenHits: () => void;
    canFeedback: boolean;
    // feedback
    counts: { useful: number; not_useful: number };
    mine: "useful" | "not_useful" | null;
    busy: boolean;
    onVoteUseful: () => void;
    onVoteNotUseful: () => void;
};

export default function Footer({
    onOpenHits,
    canFeedback,
    counts,
    mine,
    busy,
    onVoteUseful,
    onVoteNotUseful,
}: Props) {
    return (
        <div className="mt-3 pt-3 border-t border-slate-200">
            {/* Layout: izquierda (ver resultados) | divisor | derecha (feedback) */}
            <div className="grid grid-cols-[1fr_1px_1fr] items-stretch gap-3 sm:gap-4">
                {/* Izquierda */}
                <div className="flex items-center justify-start">
                    <BarButton ariaLabel="Ver resultados citados" onClick={onOpenHits} disabled={!canFeedback} icon={<IconResults />}>
                        Ver resultados
                    </BarButton>
                </div>

                {/* Divisor centro */}
                <span aria-hidden className="w-px bg-slate-200 block self-stretch" />

                {/* Derecha */}
                <div className="flex items-center justify-end gap-2">
                    <span className="text-[12.5px] text-slate-500">¿Fue útil esta respuesta?</span>
                    <div className="flex items-center gap-1.5">
                        <BarButton
                            ariaLabel="Marcar como útil"
                            onClick={onVoteUseful}
                            active={mine === "useful"}
                            disabled={!canFeedback || busy}
                            icon={<ThumbUp active={mine === "useful"} />}
                        >
                            Sí {counts.useful > 0 ? `(${counts.useful})` : ""}
                        </BarButton>
                        <BarButton
                            ariaLabel="Marcar como no útil"
                            onClick={onVoteNotUseful}
                            active={mine === "not_useful"}
                            disabled={!canFeedback || busy}
                            icon={<ThumbDown active={mine === "not_useful"} />}
                        >
                            No {counts.not_useful > 0 ? `(${counts.not_useful})` : ""}
                        </BarButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
