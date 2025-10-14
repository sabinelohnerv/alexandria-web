"use client";

import * as React from "react";
import clsx from "clsx";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function GuideModal({ open, onClose }: Props) {
    const dialogRef = React.useRef<HTMLDivElement | null>(null);
    const firstFocusRef = React.useRef<HTMLButtonElement | null>(null);

    // Cerrar con ESC y click fuera
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Foco inicial
    React.useEffect(() => {
        if (open) firstFocusRef.current?.focus();
    }, [open]);

    if (!open) return null;

    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

            {/* Panel */}
            <div
                ref={dialogRef}
                onClick={stop}
                className={clsx(
                    "relative z-[61] w-full md:max-w-2xl md:rounded-2xl bg-white",
                    "md:shadow-2xl border md:mx-4 max-h-[92vh] flex flex-col"
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                    <div className="h-8 w-8 grid place-items-center rounded-full bg-[--brand]/10 text-[--brand]">
                        {/* Ícono libro/ayuda */}
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 20.5V6.5ZM6.5 6A.5.5 0 0 0 6 6.5v12A3.5 3.5 0 0 1 9.5 15H20V6H6.5Z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-[15px]">Guía de uso</h3>
                    <button
                        ref={firstFocusRef}
                        onClick={onClose}
                        className="ml-auto rounded-md p-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#023f66]"
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                            <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7A1 1 0 1 0 5.7 7.1L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z" />
                        </svg>
                    </button>
                </div>

                {/* Body (scroll) */}
                <div className="px-4 py-4 overflow-y-auto space-y-6 text-sm leading-6">
                    {/* Sección: Qué puedo preguntar */}
                    <section>
                        <h4 className="font-semibold mb-2">¿Qué puedo preguntar?</h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            <li><strong>Búsqueda jurisprudencial:</strong> “Jurisprudencia del TSJ sobre prescripción en ejecuciones coactivas (últimos 5 años)”.</li>
                            <li><strong>Normativa aplicable:</strong> “Normas vigentes sobre medidas cautelares en el CPC con requisitos”.</li>
                        </ul>
                    </section>

                    {/* Sección: Cómo escribir mejores consultas */}
                    <section>
                        <h4 className="font-semibold mb-2">Cómo escribir mejores consultas</h4>
                        <div className="rounded-lg border p-3 bg-slate-50">
                            <p className="mb-2 text-slate-700"><strong>Formato sugerido:</strong> <em>Contexto breve</em> + <em>hechos clave</em> + <em>lo que necesitas</em> + <em>jurisdicción/fecha</em>.</p>
                            <p className="text-slate-700">Ej.: “<em>Proceso ordinario por resolución de contrato de compraventa</em>. Hechos: incumplimiento en pago del saldo. <strong>Necesito</strong> jurisprudencia reciente del TSJ sobre resolución por incumplimiento y criterios de cuantificación de daños (Bolivia, 2020–hoy).”</p>
                        </div>
                    </section>

                    {/* Sección: Buenas prácticas */}
                    <section>
                        <h4 className="font-semibold mb-2">Buenas prácticas</h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            <li>Especifica <strong>jurisdicción y rango temporal</strong> (p. ej., Bolivia, 2021–2025).</li>
                            <li>Si pides <strong>modelos</strong>, indica el <strong>destinatario</strong> (juez/tribunal) y la <strong>fase procesal</strong>.</li>
                            <li>Para jurisprudencia, aclara <strong>materia</strong> y <strong>tipo de decisión</strong> (Auto Supremo, SCP, etc.).</li>
                            <li>Revisa las <strong>fuentes/citas</strong> que se muestran y abre el PDF para confirmación.</li>
                        </ul>
                    </section>

                    {/* Sección: Ejemplos rápidos (chips) */}
                    <section>
                        <h4 className="font-semibold mb-2">Ejemplos rápidos</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "SCP sobre tutela efectiva en amparo (2022–2025)",
                                "Auto Supremo: prescripción en responsabilidad civil extracontractual",
                                "Modelo de otrosí: inspección judicial (CPC)",
                                "Plazos y cómputo para apelación en ejecución",
                            ].map((t) => (
                                <button
                                    key={t}
                                    className="rounded-full border px-3 py-1 text-xs hover:bg-slate-50"
                                    onClick={() => {
                                        // dispara un evento para autocompletar el composer
                                        window.dispatchEvent(new CustomEvent("composer-insert", { detail: t }));
                                        onClose();
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Sección: Limitaciones */}
                    <section>
                        <h4 className="font-semibold mb-2">Limitaciones</h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            <li>Las respuestas son <strong>asistidas</strong>: valida siempre en la <strong>fuente citada</strong>.</li>
                            <li>Si no hay resultados, prueba <strong>sinónimos</strong>, amplía fechas o cambia el <strong>enfoque</strong> de la consulta.</li>
                        </ul>
                    </section>
                </div>

                {/* Footer acciones */}
                <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
