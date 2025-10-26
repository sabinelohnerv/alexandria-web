"use client";
import type { Role, WhitelistEntry } from "@/lib/admin/whitelist/types";
import { useEffect, useState } from "react";

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
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />
            <div className={`relative w-[min(560px,92vw)] rounded-2xl border bg-white p-6 shadow-2xl transition-all duration-200 ${
                open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
                <h3 className="text-xl font-semibold mb-4 text-slate-800">
                    {editing ? "Editar usuario" : "Nuevo usuario"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="text-sm">
                        <span className="text-xs font-medium text-slate-600 mb-1.5 block">Nombre</span>
                        <input
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                            value={form.first_name}
                            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                            placeholder="Ingrese el nombre"
                        />
                    </label>
                    <label className="text-sm">
                        <span className="text-xs font-medium text-slate-600 mb-1.5 block">Apellido</span>
                        <input
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                            value={form.last_name}
                            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                            placeholder="Ingrese el apellido"
                        />
                    </label>
                    <label className="text-sm sm:col-span-2">
                        <span className="text-xs font-medium text-slate-600 mb-1.5 block">Email</span>
                        <input
                            type="email"
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                        />
                    </label>
                    <label className="text-sm">
                        <span className="text-xs font-medium text-slate-600 mb-1.5 block">Rol</span>
                        <select
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                            value={form.role}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button 
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                        onClick={onSubmit}
                    >
                        {editing ? "Actualizar" : "Crear"}
                    </button>
                </div>
            </div>
        </div>
    );
}
