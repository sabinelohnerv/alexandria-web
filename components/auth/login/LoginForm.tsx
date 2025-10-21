/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Alert from "@/components/ui/Alert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@/components/ui/Icons";

const Schema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof Schema>;

export default function LoginForm({
    nextUrl,
    initialEmail = "",
    onEmailChange,
}: {
    nextUrl: string;
    initialEmail?: string;
    onEmailChange?: (email: string) => void;
}) {
    const [serverError, setServerError] = useState<string>("");
    const [showPwd, setShowPwd] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(Schema),
        defaultValues: { email: initialEmail, password: "" },
    });

    const emailWatch = watch("email");
    useEffect(() => {
        onEmailChange?.(emailWatch);
    }, [emailWatch, onEmailChange]);

    useEffect(() => {
        if (initialEmail) setValue("email", initialEmail, { shouldValidate: true });
    }, [initialEmail, setValue]);

    const onSubmit = async (data: FormData) => {
        setServerError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({} as any));
                const firstKey = Object.keys(err)[0];
                const message =
                    err.detail ||
                    (firstKey && Array.isArray(err[firstKey]) ? err[firstKey][0] : undefined) ||
                    "Credenciales inválidas";
                throw new Error(message);
            }

            window.location.href = nextUrl;
        } catch (e) {
            setServerError((e as Error).message);
        }
    };

    return (
        <>
            {serverError && (
                <div className="mt-4">
                    <Alert kind="error" title="No pudimos iniciar sesión" message="No se encontraron cuentas activas con las credenciales." />
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                        className="w-full rounded-xl border bg-white p-3 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        placeholder="tucorreo@dominio.com"
                        autoComplete="username"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>

                {/* Password con toggle */}
                <div>
                    <label className="mb-1 block text-sm font-medium">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            className="w-full rounded-xl border bg-white p-3 pe-12 text-sm shadow-sm outline-none
                         focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((v) => !v)}
                            aria-pressed={showPwd}
                            className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-xs border bg-white
                         hover:bg-slate-50"
                            title={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPwd ? (
                                <IconEyeOff className="size-4 text-slate-600" />
                            ) : (
                                <IconEye className="size-4 text-slate-600" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition-transform hover:-translate-y-[1px]"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)",
                    }}
                >
                    {isSubmitting ? "Ingresando…" : "Entrar"}
                </button>
            </form>
        </>
    );
}
