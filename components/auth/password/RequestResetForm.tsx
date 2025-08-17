"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/auth/password/api";
import { useToast } from "@/components/ui/toast/ToastProvider";

const Schema = z.object({ email: z.string().email("Email inválido") });
type FormData = z.infer<typeof Schema>;

export default function RequestResetForm() {
    const router = useRouter();
    const toast = useToast();
    const [serverError, setServerError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(Schema) });

    const onSubmit = async (data: FormData) => {
        setServerError("");
        try {
            await requestPasswordReset({ email: data.email });
            toast.success("Si el email existe, enviaremos un código", "Revisa tu bandeja");
            router.push(`/password-reset/confirm?email=${encodeURIComponent(data.email)}`);
        } catch (e) {
            setServerError((e as Error).message);
            toast.error((e as Error).message || "No pudimos iniciar la recuperación", "Error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {serverError && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                    className="w-full rounded-xl border bg-white p-3 text-sm shadow-sm outline-none
                     focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                    placeholder="tucorreo@dominio.com"
                    autoComplete="email"
                    {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <button
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md
                   disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:-translate-y-[1px]"
                style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
            >
                {isSubmitting ? "Enviando…" : "Enviar código"}
            </button>
        </form>
    );
}
