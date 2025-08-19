"use client";

import BrandHeader from "@/components/auth/login/BrandHeader";
import RequestResetForm from "./RequestResetForm";

export default function RequestResetCard() {
    return (
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden">
            <BrandHeader />
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-center">Recuperar contraseña</h1>
                <p className="mt-1 text-center text-sm text-[--muted]">
                    Ingresa tu email y te enviaremos un código de verificación.
                </p>
                <RequestResetForm />
                <div className="mt-4 text-center text-xs">
                    <a className="hover:underline" href="/login">Volver atrás</a>
                </div>
            </div>
        </div>
    );
}
