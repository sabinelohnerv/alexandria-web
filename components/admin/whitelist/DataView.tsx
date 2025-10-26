"use client";
import RowActions from "./RowActions";
import type { WhitelistEntry } from "@/lib/admin/whitelist/types";
import { TableRowSkeleton, CardSkeleton } from "@/components/ui/SkeletonLoader";

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
        <div className="flex-1 min-h-0 overflow-auto border rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
            <table className="hidden md:table w-full text-sm table-fixed min-w-[980px]">
                <colgroup>
                    {["w-14", "w-64", "w-80", "w-28", "w-28", "w-44"].map((cls, i) => (
                        <col key={i} className={cls} />
                    ))}
                </colgroup>

                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
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
                    {!loading && rows.map((r, i) => (
                        <tr key={r.id} className="border-t border-slate-200 hover:bg-[#023f660D] transition-colors duration-150 animate-fadeIn">
                            <td className="p-3 border-r border-slate-200 align-middle">{i + 1}</td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <div className="truncate">
                                    {r.first_name} {r.last_name}
                                </div>
                            </td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <div className="truncate">{r.email}</div>
                            </td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${
                                    r.role === "admin" 
                                        ? "bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand)]/20" 
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                    {r.role === "admin" ? "Administrador" : "Usuario"}
                                </span>
                            </td>
                            <td className="p-3 border-r border-slate-200 align-middle">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                                    r.is_active 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    {r.is_active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td className="p-3 text-right align-middle">
                                <RowActions row={r} onEdit={onEdit} onToggle={onToggle} />
                            </td>
                        </tr>
                    ))}

                    {loading && (
                        <>
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                        </>
                    )}
                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-12 text-center">
                                <div className="flex flex-col items-center gap-3 animate-fadeIn">
                                    <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <div>
                                        <p className="text-slate-600 font-medium">No se encontraron resultados</p>
                                        <p className="text-sm text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Cards (móvil) */}
            <div className="md:hidden divide-y">
                {!loading && rows.map((r, i) => (
                    <div key={r.id} className="p-3 hover:bg-slate-50 transition-colors duration-150 animate-fadeIn">
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium truncate">
                                <span className="inline-block w-6 text-slate-500">#{i + 1}</span>{" "}
                                {r.first_name} {r.last_name}
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                                r.is_active 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
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

                {loading && (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                )}
                {!loading && rows.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3 animate-fadeIn">
                            <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <div>
                                <p className="text-slate-600 font-medium">No se encontraron resultados</p>
                                <p className="text-sm text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
