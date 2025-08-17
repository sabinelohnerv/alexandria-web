"use client";

import * as React from "react"; // ← Importa React como módulo
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { confirmRegisterOtp, resendRegisterOtp } from "@/lib/auth/register/api";
import OtpInput from "@/components/ui/OtpInput";

const Schema = z.object({
    email: z.string().email("Email inválido"),
    code: z.string().regex(/^\d{6}$/, "Debe ser un código de 6 dígitos"),
});

type FormData = z.infer<typeof Schema>;

export default function ConfirmOtpForm({ email = "" }: { email?: string }) {
    const router = useRouter();
    const toast = useToast();

    const {
        handleSubmit,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<FormData>({
        resolver: zodResolver(Schema),
        defaultValues: { email, code: "" },
    });

    const [code, setCode] = useState("");
    const [cooldown, setCooldown] = useState(60);
    const [resending, setResending] = useState(false);

    // contador de 60s
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    async function onSubmit() {
        try {
            const payload: FormData = { email, code };
            const parsed = Schema.safeParse(payload);
            if (!parsed.success) return;

            // La API espera `otp`, no `code`
            await confirmRegisterOtp({ email, otp_code: code });
            toast.success("Cuenta confirmada", "¡Listo! Ahora puedes iniciar sesión");
            router.push(`/login?email=${encodeURIComponent(email)}`);
        } catch (e) {
            toast.error(
                (e as Error).message || "Código inválido",
                "Error"
            );
        }
    }

    async function onResend() {
        if (cooldown > 0 || resending) return;
        try {
            setResending(true);
            await resendRegisterOtp(email);
            setCooldown(60);
            toast.info("Nuevo código enviado", "Revisa tu bandeja");
        } catch (e) {
            toast.error(
                (e as Error).message || "No pudimos reenviar el código",
                "Error"
            );
        } finally {
            setResending(false);
        }
    }

    // Mantener RHF sincronizado
    useEffect(() => {
        setValue("code", code, { shouldValidate: true });
    }, [code, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Email (solo lectura) */}
            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                    className="w-full rounded-xl border bg-slate-50 p-3 text-sm shadow-sm outline-none"
                    value={email}
                    readOnly
                />
            </div>

            {/* OTP */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Código de verificación
                </label>
                <OtpInput length={6} value={code} onChange={setCode} />
                {errors.code && (
                    <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
                )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onResend}
                    disabled={cooldown > 0 || resending}
                    className="text-xs underline disabled:no-underline disabled:text-slate-400"
                >
                    {cooldown > 0
                        ? `Reenviar en ${String(Math.floor(cooldown)).padStart(2, "0")}s`
                        : "Reenviar código"}
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting || code.length !== 6}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)",
                    }}
                >
                    {isSubmitting ? "Verificando…" : "Confirmar"}
                </button>
            </div>
        </form>
    );
}
