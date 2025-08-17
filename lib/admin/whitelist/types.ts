export type Role = "admin" | "user";

export interface WhitelistEntry {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
    is_active: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export type WhitelistList = WhitelistEntry[];
