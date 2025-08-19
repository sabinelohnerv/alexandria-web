export type Role = "admin" | "user";

export type RequestOtpRequest = {
    email: string;
    password: string;
};

export type ConfirmOtpRequest = {
    email: string;
    otp_code: string;
};

export type RegisterStatus = {
    email: string;
    allowed: boolean;
    role: Role;
    has_pending: boolean;
    status: "none" | "pending" | "expired" | "verified";
    expires_in_seconds?: number;
    attempts_left?: number;
    resend_available?: boolean;
    resend_in_seconds?: number;
    confirm_available?: boolean;
    resend_count?: number;
};
