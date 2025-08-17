/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    createWhitelist,
    deactivateWhitelist,
    listWhitelist,
    reactivateWhitelist,
    updateWhitelist,
} from "@/lib/admin/whitelist/api";
import type { Role, WhitelistEntry } from "@/lib/admin/whitelist/types";
import WhitelistToolbar, { Ordering } from "./Toolbar";
import DataView from "./DataView";
import EditModal from "./EditModal";
import { useToast } from "@/components/ui/toast/ToastProvider";

type State = {
    data: WhitelistEntry[];
    loading: boolean;
    error?: string;
    search: string;
    ordering?: Ordering;
    role?: Role;
    show_inactive: boolean; // → status=all
};

export default function WhitelistAdmin() {
    const toast = useToast();

    const [st, setSt] = useState<State>({
        data: [],
        loading: true,
        search: "",
        show_inactive: true, // por defecto "todos"
    });

    async function load() {
        setSt((s) => ({ ...s, loading: true, error: undefined }));
        try {
            const data = await listWhitelist({
                include_inactive: st.show_inactive,
                role: st.role,
                search: st.search,
                ordering: st.ordering,
            });
            setSt((s) => ({ ...s, data, loading: false }));
        } catch (e: any) {
            const msg = e?.message || "No se pudo obtener el whitelist";
            setSt((s) => ({ ...s, loading: false, error: msg }));
            toast.error(msg, "Error al cargar");
        }
    }

    // Carga inicial
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch cuando cambien filtros (debounce para search)
    useEffect(() => {
        const t = setTimeout(() => { load(); }, st.search ? 300 : 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [st.show_inactive, st.role, st.ordering, st.search]);

    // ---- Modal state ----
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<WhitelistEntry | null>(null);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "user" as Role,
    });

    function openCreate() {
        setEditing(null); // modo crear
        setForm({ first_name: "", last_name: "", email: "", role: "user" });
        setModalOpen(true);
    }

    function openEdit(row: WhitelistEntry) {
        setEditing(row); // modo editar
        setForm({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            role: row.role,
        });
        setModalOpen(true);
    }

    async function submitForm() {
        // Validación rápida opcional
        if (!form.first_name.trim() || !form.last_name.trim()) {
            toast.error("Nombre y apellido son obligatorios");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            toast.error("Email no válido");
            return;
        }

        try {
            if (editing) {
                await updateWhitelist(editing.id, form);
                toast.success("Usuario actualizado correctamente", "Actualizado");
            } else {
                await createWhitelist(form);
                toast.success("Usuario creado correctamente", "Creado");
            }
            setModalOpen(false);
            setEditing(null);
            await load();
        } catch (e: any) {
            toast.error(e?.message || "No se pudo guardar", "Error");
        }
    }

    async function toggleActive(row: WhitelistEntry) {
        try {
            if (row.is_active) {
                await deactivateWhitelist(row.id);
                toast.info(`Se desactivó a ${row.first_name}`, "Estado actualizado");
            } else {
                await reactivateWhitelist(row.id);
                toast.success(`Se reactivó a ${row.first_name}`, "Estado actualizado");
            }
            await load();
        } catch (e: any) {
            toast.error(e?.message || "No se pudo cambiar el estado", "Error");
        }
    }

    // El servidor ya filtra/ordena/busca
    const rows = useMemo(() => st.data, [st.data]);

    return (
        <section className="h-full min-h-0 flex flex-col gap-3">
            <WhitelistToolbar st={st} setSt={setSt} onCreate={openCreate} />

            <DataView rows={rows} onEdit={openEdit} onToggle={toggleActive} loading={st.loading} />

            <EditModal
                open={modalOpen}
                editing={editing}
                form={form}
                setForm={setForm}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSubmit={submitForm}
            />
        </section>
    );
}
