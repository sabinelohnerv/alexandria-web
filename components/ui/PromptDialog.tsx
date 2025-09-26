"use client";

import * as React from "react";
import Modal from "./Modal";

type Props = {
    open: boolean;
    title?: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
    onSubmit: (value: string) => void | Promise<void>;
    validate?: (value: string) => string | null; // devuelve error o null
    loading?: boolean;
};

export default function PromptDialog({
    open,
    title = "Ingresar texto",
    label = "Nombre",
    placeholder,
    initialValue = "",
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    onCancel,
    onSubmit,
    validate,
    loading,
}: Props) {
    const [value, setValue] = React.useState(initialValue);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setValue(initialValue);
            setError(null);
        }
    }, [open, initialValue]);

    const handleSubmit = async () => {
        const v = value.trim();
        const err = validate ? validate(v) : v ? null : "El campo es obligatorio.";
        if (err) {
            setError(err);
            return;
        }
        await onSubmit(v);
    };

    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
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
                        onClick={handleSubmit}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-md text-sm text-white shadow bg-[color:var(--brand,#023f66)] hover:opacity-90 disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </div>
            }
        >
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </Modal>
    );
}
