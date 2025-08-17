// components/auth/login/LoginCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import BrandHeader from "./BrandHeader";
import LoginForm from "./LoginForm";

export default function LoginCard({
    nextUrl,
    initialEmail = "",
}: {
    nextUrl: string;
    initialEmail?: string;
}) {
    const [emailForRegister, setEmailForRegister] = useState(initialEmail);

    const registerHref = emailForRegister
        ? `/register?email=${encodeURIComponent(emailForRegister)}`
        : "/register";

    return (
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden">
            <BrandHeader />
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>
                <p className="mt-1 text-center text-sm text-[--muted]">
                    Bienvenido(a) a{" "}
                    <span className="font-medium" style={{ color: "var(--brand)" }}>
                        Alexandria
                    </span>
                </p>

                <LoginForm
                    nextUrl={nextUrl}
                    initialEmail={initialEmail}
                    onEmailChange={(v) => setEmailForRegister(v)}
                />

                <div className="mt-4 flex items-center justify-between text-xs text-[--secondary]">
                    <Link className="hover:underline" href={registerHref}>
                        Crear cuenta
                    </Link>
                    <a className="hover:underline" href="/password-reset">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
            </div>
        </div>
    );
}
