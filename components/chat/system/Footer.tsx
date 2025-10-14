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
    //counts,
    mine,
    busy,
    onVoteUseful,
    onVoteNotUseful,
}: Props) {
    return (
        <div className="mt-3 pt-3 border-t border-slate-200">
            {/* Móvil: apilado (feedback → resultados). sm+: [izq | divisor | der] */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr] items-stretch gap-3 sm:gap-4">
                {/* IZQUIERDA: Feedback */}
                <div className="flex items-center justify-start gap-2 sm:gap-2">
                    <span className="text-xs sm:text-[12.5px] text-slate-500">
                        ¿Fue útil esta respuesta?
                    </span>
                    <div className="flex items-center gap-1.5">
                        <BarButton
                            ariaLabel="Marcar como útil"
                            onClick={onVoteUseful}
                            active={mine === "useful"}
                            disabled={!canFeedback || busy}
                            icon={<ThumbUp active={mine === "useful"} />}
                        >
                            Sí
                        </BarButton>
                        <BarButton
                            ariaLabel="Marcar como no útil"
                            onClick={onVoteNotUseful}
                            active={mine === "not_useful"}
                            disabled={!canFeedback || busy}
                            icon={<ThumbDown active={mine === "not_useful"} />}
                        >
                            No
                        </BarButton>
                    </div>
                </div>

                {/* Divisor centro (oculto en pantallas pequeñas) */}
                <span aria-hidden className="hidden sm:block w-px bg-slate-200 self-stretch" />

                {/* DERECHA: Ver resultados */}
                <div className="flex items-center justify-end">
                    <BarButton
                        ariaLabel="Ver fuentes citadas"
                        onClick={onOpenHits}
                        disabled={!canFeedback}
                        icon={<IconResults />}
                    >
                        Calificar fuentes citadas
                    </BarButton>
                </div>
            </div>
        </div>
    );
}
