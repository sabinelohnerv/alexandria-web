"use client";
import BrandHeader from "../login/BrandHeader";
import RegisterForm from "./RegisterForm";

export default function RegisterCard() {
    return (
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-xl overflow-hidden">
            <BrandHeader />
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
                <p className="mt-1 text-center text-sm text-[--muted]">
                    Regístrate para usar{" "}
                    <span className="font-medium" style={{ color: "var(--brand)" }}>
                        Alexandria
                    </span>
                </p>
                <RegisterForm />
                <div className="mt-4 text-center text-xs">
                    ¿Ya tienes cuenta?{" "}
                    <a className="hover:underline" href="/login">Inicia sesión</a>
                </div>
            </div>
        </div>
    );
}
