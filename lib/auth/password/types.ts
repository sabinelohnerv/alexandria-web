export type PasswordRequestReset = { email: string };

export type PasswordResendReset = { email: string };

export type PasswordConfirmReset = {
    email: string;
    otp_code: string;
    new_password: string;
};

export type PasswordResetStatus = {
    email: string;
    has_ticket: boolean;
    status: "none" | "pending" | "expired" | "used";
    expires_in_seconds?: number;
    attempts_left?: number;
    resend_available?: boolean;
    resend_in_seconds?: number;
    resend_count?: number;
    cooldown_seconds?: number;
    ttl_minutes?: number;
};
