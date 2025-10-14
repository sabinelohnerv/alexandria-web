"use client";

import * as React from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PromptDialog from "@/components/ui/PromptDialog";
import KebabMenu from "@/components/ui/KebabMenu";

export type SessionPreview = {
    id: number;
    title: string;
    updatedAt: string; // ISO
    isDeleted?: boolean;
};

type Props = {
    session: SessionPreview;
    active?: boolean;
    onSelect: (id: number) => void | Promise<void>;
    onRename: (id: number, newTitle: string) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
};

function fmtAbsolute(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
}

// “hace 2 h / 3 d / 5 min”
function fmtRelative(iso: string) {
    try {
        const d = new Date(iso).getTime();
        const now = Date.now();
        const diff = Math.max(0, now - d);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "ahora";
        if (minutes < 60) return `hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours} h`;
        const days = Math.floor(hours / 24);
        return `hace ${days} d`;
    } catch {
        return iso;
    }
}

function Dot({ active }: { active?: boolean }) {
    return (
        <span
            className={[
                "inline-block h-2 w-2 rounded-full",
                active ? "bg-[#023f66]" : "bg-slate-300 group-hover:bg-slate-400",
            ].join(" ")}
            aria-hidden="true"
        />
    );
}

function SessionTileBase({ session, active, onSelect, onRename, onDelete }: Props) {
    const handleSelect = React.useCallback(() => onSelect(session.id), [onSelect, session.id]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
        }
    };

    // popups
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
                title={fmtAbsolute(session.updatedAt)}
                className={[
                    "group relative grid h-16 grid-cols-[1fr_auto] items-center px-3 transition-colors",
                    active
                        ? "bg-[#023f6614] ring-2 ring-inset ring-[#023f66]"
                        : "hover:bg-[#023f660D]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#023f66]",
                ].join(" ")}
            >
                {/* Columna izquierda */}
                <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <Dot active={active} />
                        <div className="truncate text-[15px] leading-tight">
                            {session.title || `(sesión #${session.id})`}
                        </div>
                    </div>
                    <div
                        className="text-[11px] text-slate-500 mt-1"
                        aria-label={`Actualizada ${fmtRelative(session.updatedAt)}`}
                    >
                        {fmtRelative(session.updatedAt)}
                    </div>
                </div>

                {/* Kebab */}
                <div
                    className={[
                        "transition-opacity",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()}
                >
                    <KebabMenu
                        title="Opciones"
                        items={[
                            { label: "Renombrar", onClick: () => setRenameOpen(true) },
                            { label: "Eliminar", danger: true, onClick: () => setDeleteOpen(true) },
                        ]}
                    />
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
                validate={(v) => (v.trim().length < 2 ? "Mínimo 2 caracteres." : null)}
                submitLabel="Guardar"
                loading={busy}
            />

            {/* Confirm eliminar */}
            <ConfirmDialog
                open={deleteOpen}
                title="Eliminar sesión"
                description={
                    <p>
                        ¿Seguro que deseas eliminar{" "}
                        <strong>{session.title || `sesión #${session.id}`}</strong>? Esta acción no se puede deshacer.
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
