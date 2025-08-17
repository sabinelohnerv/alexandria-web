"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { confirmPasswordReset, resendPasswordReset } from "@/lib/auth/password/api";
import OtpInput from "@/components/ui/OtpInput";
import { IconEye, IconEyeOff } from "@/components/ui/Icons";

const Schema = z.object({
    email: z.string().email("Email inválido"),
    otp_code: z.string().regex(/^\d{6}$/, "Debe ser un código de 6 dígitos"),
    new_password: z.string().min(8, "Mínimo 8 caracteres"),
});
type FormData = z.infer<typeof Schema>;

export default function ConfirmResetForm({ email = "" }: { email?: string }) {
    const router = useRouter();
    const toast = useToast();

    const {
        handleSubmit,
        setValue,
        register,
        formState: { isSubmitting, errors },
    } = useForm<FormData>({
        resolver: zodResolver(Schema),
        defaultValues: { email, otp_code: "", new_password: "" },
    });

    const [code, setCode] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [cooldown, setCooldown] = useState(60);
    const [resending, setResending] = useState(false);

    // contador 60s para reenviar
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    // Sync RHF con OTP local
    useEffect(() => { setValue("otp_code", code, { shouldValidate: true }); }, [code, setValue]);

    async function onSubmit(data: FormData) {
        try {
            await confirmPasswordReset({
                email: data.email,
                otp_code: data.otp_code,
                new_password: data.new_password,
            });
            toast.success("Tu contraseña fue actualizada", "Ahora puedes iniciar sesión");
            router.push(`/login?email=${encodeURIComponent(data.email)}`);
        } catch (e) {
            toast.error((e as Error).message || "No pudimos actualizar tu contraseña", "Error");
        }
    }

    async function onResend() {
        if (cooldown > 0 || resending) return;
        try {
            setResending(true);
            await resendPasswordReset({ email });
            setCooldown(60);
            toast.info("Si el email existe, reenviamos el código", "Revisa tu bandeja");
        } catch (e) {
            toast.error((e as Error).message || "No pudimos reenviar el código", "Error");
        } finally {
            setResending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Email (solo lectura editable si prefieres permitir cambiarlo) */}
            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                    className="w-full rounded-xl border bg-slate-50 p-3 text-sm shadow-sm outline-none"
                    value={email}
                    readOnly
                    {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* OTP */}
            <div>
                <label className="mb-2 block text-sm font-medium">Código de verificación</label>
                <OtpInput length={6} value={code} onChange={setCode} />
                {errors.otp_code && <p className="mt-1 text-xs text-red-600">{errors.otp_code.message}</p>}
                <div className="mt-2 text-right">
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={cooldown > 0 || resending}
                        className="text-xs underline disabled:no-underline disabled:text-slate-400"
                    >
                        {cooldown > 0 ? `Reenviar en ${String(Math.floor(cooldown)).padStart(2, "0")}s` : "Reenviar código"}
                    </button>
                </div>
            </div>

            {/* Nueva contraseña con ver/ocultar */}
            <div>
                <label className="mb-1 block text-sm font-medium">Nueva contraseña</label>
                <div className="relative">
                    <input
                        type={showPwd ? "text" : "password"}
                        className="w-full rounded-xl border bg-white p-3 pe-12 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register("new_password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-pressed={showPwd}
                        className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-md text-xs border bg-white hover:bg-slate-50"
                        title={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPwd ? (
                            <IconEyeOff className="size-4 text-slate-600" />
                        ) : (
                            <IconEye className="size-4 text-slate-600" />
                        )}
                    </button>
                </div>
                {errors.new_password && (
                    <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md
                   disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:-translate-y-[1px]"
                style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
            >
                {isSubmitting ? "Actualizando…" : "Cambiar contraseña"}
            </button>
        </form>
    );
}
