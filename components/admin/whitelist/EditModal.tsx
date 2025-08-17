"use client";
import type { Role, WhitelistEntry } from "@/lib/admin/whitelist/types";

export default function EditModal({
    open,
    editing,
    form,
    setForm,
    onClose,
    onSubmit,
}: {
    open: boolean;
    editing: WhitelistEntry | null;
    form: { first_name: string; last_name: string; email: string; role: Role };
    setForm: React.Dispatch<
        React.SetStateAction<{ first_name: string; last_name: string; email: string; role: Role }>
    >;
    onClose: () => void;
    onSubmit: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-[min(560px,92vw)] rounded-2xl border bg-white p-4">
                <h3 className="text-lg font-semibold mb-3">{editing ? "Editar" : "Nuevo"}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                        <span className="text-xs text-slate-500">Nombre</span>
                        <input
                            className="mt-1 w-full rounded-lg border p-2"
                            value={form.first_name}
                            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                        />
                    </label>
                    <label className="text-sm">
                        <span className="text-xs text-slate-500">Apellido</span>
                        <input
                            className="mt-1 w-full rounded-lg border p-2"
                            value={form.last_name}
                            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                        />
                    </label>
                    <label className="text-sm sm:col-span-2">
                        <span className="text-xs text-slate-500">Email</span>
                        <input
                            className="mt-1 w-full rounded-lg border p-2"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                    </label>
                    <label className="text-sm">
                        <span className="text-xs text-slate-500">Rol</span>
                        <select
                            className="mt-1 w-full rounded-lg border p-2"
                            value={form.role}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button className="rounded border px-3 py-2 bg-white" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="rounded px-3 py-2 text-white"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                        onClick={onSubmit}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
