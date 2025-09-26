"use client";

import * as React from "react";
import Modal from "./Modal";

type Props = {
    open: boolean;
    title?: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
};

export default function ConfirmDialog({
    open,
    title = "Confirmar",
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    danger,
    onCancel,
    onConfirm,
    loading,
}: Props) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            danger={danger}
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-white"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!!loading}
                        className={`px-3 py-1.5 rounded-md text-sm text-white shadow disabled:opacity-60 ${danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-[color:var(--brand,#023f66)] hover:opacity-90"
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            }
        >
            {description}
        </Modal>
    );
}
