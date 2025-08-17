"use client";
import RowActions from "./RowActions";
import type { WhitelistEntry } from "@/lib/admin/whitelist/types";

export default function DataView({
    rows,
    onEdit,
    onToggle,
    loading,
}: {
    rows: WhitelistEntry[];
    onEdit: (row: WhitelistEntry) => void;
    onToggle: (row: WhitelistEntry) => void;
    loading: boolean;
}) {
    return (
        <div className="flex-1 min-h-0 overflow-auto border rounded-xl bg-white">
            {/* Tabla (md+) con anchos fijos y divisiones verticales */}
            <table className="hidden md:table w-full text-sm table-fixed min-w-[980px]">
                {/* ¡Importante! Generar los <col> vía array para evitar whitespace en <colgroup> */}
                <colgroup>
                    {["w-14", "w-64", "w-80", "w-28", "w-28", "w-44"].map((cls, i) => (
                        <col key={i} className={cls} />
                    ))}
                </colgroup>

                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                        <th className="p-3 text-left border-r border-slate-200">#</th>
                        <th className="p-3 text-left border-r border-slate-200">Nombre</th>
                        <th className="p-3 text-left border-r border-slate-200">Email</th>
                        <th className="p-3 text-left border-r border-slate-200">Rol</th>
                        <th className="p-3 text-left border-r border-slate-200">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((r, i) => (
                        <tr key={r.id} className="border-t border-slate-200 hover:bg-[#023f660D]">
                            <td className="p-3 border-r border-slate-200 align-middle">{i + 1}</td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <div className="truncate">
                                    {r.first_name} {r.last_name}
                                </div>
                            </td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <div className="truncate">{r.email}</div>
                            </td>
                            <td className="p-3 border-r border-slate-200 align-middle capitalize">{r.role}</td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                {r.is_active ? "Activo" : "Inactivo"}
                            </td>
                            <td className="p-3 text-right align-middle">
                                <RowActions row={r} onEdit={onEdit} onToggle={onToggle} />
                            </td>
                        </tr>
                    ))}

                    {loading && (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                Cargando…
                            </td>
                        </tr>
                    )}
                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                Sin resultados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Cards (móvil) */}
            <div className="md:hidden divide-y">
                {rows.map((r, i) => (
                    <div key={r.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium truncate">
                                <span className="inline-block w-6 text-slate-500">#{i + 1}</span>{" "}
                                {r.first_name} {r.last_name}
                            </div>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                                    }`}
                            >
                                {r.is_active ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate">{r.email}</div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500 capitalize">Rol: {r.role}</span>
                            <RowActions row={r} onEdit={onEdit} onToggle={onToggle} />
                        </div>
                    </div>
                ))}

                {loading && <div className="p-6 text-center text-slate-500">Cargando…</div>}
                {!loading && rows.length === 0 && (
                    <div className="p-6 text-center text-slate-500">Sin resultados</div>
                )}
            </div>
        </div>
    );
}
