"use client";

import * as React from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PromptDialog from "@/components/ui/PromptDialog";

export type SessionPreview = {
    id: number;
    title: string;
    updatedAt: string;
    isDeleted?: boolean;
};

type Props = {
    session: SessionPreview;
    active?: boolean;
    onSelect: (id: number) => void | Promise<void>;
    onRename: (id: number, newTitle: string) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
};

function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
}

function SessionTileBase({ session, active, onSelect, onRename, onDelete }: Props) {
    const handleSelect = React.useCallback(() => onSelect(session.id), [onSelect, session.id]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
        }
    };

    // Estado de popups
    const [renameOpen, setRenameOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

    const submitRename = async (value: string) => {
        setBusy(true);
        try {
            await onRename(session.id, value);
            setRenameOpen(false);
        } finally {
            setBusy(false);
        }
    };

    const submitDelete = async () => {
        setBusy(true);
        try {
            await onDelete(session.id);
            setDeleteOpen(false);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
                title={fmtDate(session.updatedAt)}
                className={[
                    "group relative grid h-16 grid-cols-[1fr_auto] items-center px-3 rounded-none transition-colors",
                    active
                        ? "bg-[#023f661F] ring-2 ring-inset ring-[#023f66] after:absolute after:inset-y-1.5 after:left-0 after:w-1.5 after:bg-[#023f66]"
                        : "hover:bg-[#023f660D]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#023f66]",
                ].join(" ")}
            >
                {/* Columna izquierda */}
                <div className="min-w-0">
                    <div className="truncate">{session.title || `(sesión #${session.id})`}</div>
                    <div className="text-[11px] text-slate-500">{fmtDate(session.updatedAt)}</div>
                </div>

                {/* Acciones (solo hover/focus) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRenameOpen(true);
                        }}
                        className="text-xs underline rounded px-1 hover:bg-white"
                        aria-label="Renombrar"
                    >
                        Renombrar
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteOpen(true);
                        }}
                        className="text-xs text-red-600 underline rounded px-1 hover:bg-white"
                        aria-label="Eliminar"
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Prompt renombrar */}
            <PromptDialog
                open={renameOpen}
                title="Renombrar sesión"
                label="Nuevo nombre"
                placeholder="Escribe un nombre…"
                initialValue={session.title}
                onCancel={() => !busy && setRenameOpen(false)}
                onSubmit={submitRename}
                validate={(v) => (v.length < 2 ? "Mínimo 2 caracteres." : null)}
                submitLabel="Guardar"
                loading={busy}
            />

            {/* Confirm eliminar */}
            <ConfirmDialog
                open={deleteOpen}
                title="Eliminar sesión"
                description={
                    <p>
                        ¿Seguro que deseas eliminar <strong>{session.title || `sesión #${session.id}`}</strong>?
                        Esta acción no se puede deshacer.
                    </p>
                }
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                danger
                onCancel={() => !busy && setDeleteOpen(false)}
                onConfirm={submitDelete}
                loading={busy}
            />
        </>
    );
}

const SessionTile = React.memo(SessionTileBase);
SessionTile.displayName = "SessionTile";

export default SessionTile;
