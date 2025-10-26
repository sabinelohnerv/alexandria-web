/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IconPlus, IconSearch, IconSort } from "@/components/ui/Icons";
import type { Role } from "@/lib/admin/whitelist/types";

export type Ordering =
    | "first_name" | "-first_name"
    | "last_name" | "-last_name"
    | "email" | "-email"
    | "created_at" | "-created_at"
    | "role" | "-role";

export type ToolbarState = {
    search: string;
    role?: Role;
    ordering?: Ordering;
    show_inactive: boolean;
};

export default function WhitelistToolbar({
    st,
    setSt,
    onCreate,
}: {
    st: ToolbarState;
    setSt: React.Dispatch<React.SetStateAction<any>>;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border shadow-sm">
            {/* Buscar */}
            <div className="flex-1 min-w-56">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
                    <IconSearch className="text-slate-400" /> Buscar
                </label>
                <input
                    value={st.search}
                    onChange={(e) => setSt((s: any) => ({ ...s, search: e.target.value }))}
                    placeholder="Nombre, apellido o email…"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all"
                />
            </div>

            {/* Rol */}
            <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Rol</label>
                <select
                    className="block rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all"
                    value={st.role ?? ""}
                    onChange={(e) => setSt((s: any) => ({ ...s, role: (e.target.value || undefined) as Role }))}
                >
                    <option value="">Todos</option>
                    <option value="admin">Administrador</option>
                    <option value="user">Usuario</option>
                </select>
            </div>

            {/* Orden */}
            <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1.5">
                    <IconSort className="text-slate-400" /> Orden
                </label>
                <select
                    className="block rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all"
                    value={st.ordering ?? ""}
                    onChange={(e) => setSt((s: any) => ({ ...s, ordering: (e.target.value || undefined) as Ordering }))}
                >
                    <option value="">Por defecto</option>
                    <option value="first_name">Nombre ↑</option>
                    <option value="-first_name">Nombre ↓</option>
                    <option value="last_name">Apellido ↑</option>
                    <option value="-last_name">Apellido ↓</option>
                    <option value="email">Email ↑</option>
                    <option value="-email">Email ↓</option>
                    <option value="created_at">Creado ↑</option>
                    <option value="-created_at">Creado ↓</option>
                    <option value="role">Rol ↑</option>
                    <option value="-role">Rol ↓</option>
                </select>
            </div>

            {/* Mostrar inactivos */}
            <label className="inline-flex items-center gap-2 text-sm ps-1 cursor-pointer hover:text-[var(--brand)] transition-colors">
                <input
                    type="checkbox"
                    checked={st.show_inactive}
                    onChange={(e) => setSt((s: any) => ({ ...s, show_inactive: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all cursor-pointer"
                />
                Mostrar inactivos
            </label>

            {/* Crear */}
            <div className="ms-auto">
                <button
                    onClick={onCreate}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                    style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                >
                    <IconPlus className="text-white" />
                    Nuevo usuario
                </button>
            </div>
        </div>
    );
}
