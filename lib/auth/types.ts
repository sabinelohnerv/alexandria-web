export type Role = "admin" | "user";

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    is_staff: boolean;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}
