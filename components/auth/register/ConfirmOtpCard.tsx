"use client";

import BrandHeader from "@/components/auth/login/BrandHeader";
import ConfirmOtpForm from "./ConfirmOtpForm";

export default function ConfirmOtpCard({ email = "" }: { email?: string }) {
    return (
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden">
            <BrandHeader />
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-center">Confirmar código</h1>
                <p className="mt-1 text-center text-sm text-[--muted]">
                    Te enviamos un código a{" "}
                    <span className="font-medium">{email || "tu correo"}</span>.
                </p>

                <ConfirmOtpForm email={email} />

                <div className="mt-4 text-center text-xs text-[--secondary]">
                    ¿Es un email incorrecto?{" "}
                    <a
                        className="hover:underline"
                        href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    >
                        Cambiar email
                    </a>
                </div>
            </div>
        </div>
    );
}
