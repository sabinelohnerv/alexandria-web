"use client";
import IconButton from "@/components/ui/IconButton";
import { IconPencil, IconPower, IconRotateCw } from "@/components/ui/Icons";
import type { WhitelistEntry } from "@/lib/admin/whitelist/types";

export default function RowActions({
    row,
    onEdit,
    onToggle,
}: {
    row: WhitelistEntry;
    onEdit: (row: WhitelistEntry) => void;
    onToggle: (row: WhitelistEntry) => void;
}) {
    return (
        <div className="flex items-center justify-end gap-1 sm:gap-2">
            <IconButton
                title="Editar"
                label="Editar"
                kind="ghost"
                onClick={() => onEdit(row)}
                icon={<IconPencil className="text-slate-700" />}
            />
            {row.is_active ? (
                <IconButton
                    title="Desactivar"
                    label="Desactivar"
                    kind="danger"
                    onClick={() => onToggle(row)}
                    icon={<IconPower className="text-red-600" />}
                />
            ) : (
                <IconButton
                    title="Reactivar"
                    label="Reactivar"
                    kind="green"
                    onClick={() => onToggle(row)}
                    icon={<IconRotateCw className="text-green-600" />}
                />
            )}
        </div>
    );
}
