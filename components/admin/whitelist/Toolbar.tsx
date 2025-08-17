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
        <div className="flex flex-wrap items-end gap-2">
            {/* Buscar */}
            <div className="flex-1 min-w-56">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                    <IconSearch className="text-slate-400" /> Buscar
                </label>
                <input
                    value={st.search}
                    onChange={(e) => setSt((s: any) => ({ ...s, search: e.target.value }))}
                    placeholder="Nombre, apellido o email…"
                    className="mt-1 w-full rounded-lg border bg-white p-2 text-sm"
                />
            </div>

            {/* Rol */}
            <div>
                <label className="text-xs text-slate-500">Rol</label>
                <select
                    className="mt-1 block rounded-lg border bg-white p-2 text-sm"
                    value={st.role ?? ""}
                    onChange={(e) => setSt((s: any) => ({ ...s, role: (e.target.value || undefined) as Role }))}
                >
                    <option value="">Todos</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Orden */}
            <div>
                <label className="flex items-center gap-1 text-xs text-slate-500">
                    <IconSort className="text-slate-400" /> Orden
                </label>
                <select
                    className="mt-1 block rounded-lg border bg-white p-2 text-sm"
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
            <label className="inline-flex items-center gap-2 text-sm ps-1">
                <input
                    type="checkbox"
                    checked={st.show_inactive}
                    onChange={(e) => setSt((s: any) => ({ ...s, show_inactive: e.target.checked }))}
                />
                Mostrar inactivos
            </label>

            {/* Crear */}
            <div className="ms-auto">
                <button
                    onClick={onCreate}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                >
                    <IconPlus className="text-white" />
                    Nuevo
                </button>
            </div>
        </div>
    );
}
