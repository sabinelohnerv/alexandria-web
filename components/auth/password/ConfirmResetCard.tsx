"use client";

import BrandHeader from "@/components/auth/login/BrandHeader";
import ConfirmResetForm from "./ConfirmResetForm";

export default function ConfirmResetCard({ email = "" }: { email?: string }) {
    return (
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden">
            <BrandHeader />
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-center">Confirmar código</h1>
                <p className="mt-1 text-center text-sm text-[--muted]">
                    Ingresa el código enviado a <span className="font-medium">{email || "tu correo"}</span> y tu nueva contraseña.
                </p>
                <ConfirmResetForm email={email} />
            </div>
        </div>
    );
}
