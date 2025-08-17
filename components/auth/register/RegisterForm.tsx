/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestRegisterOtp } from "@/lib/auth/register/api";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@/components/ui/Icons";

const Schema = z
    .object({
        first_name: z.string().min(2, "Mínimo 2 caracteres"),
        last_name: z.string().min(2, "Mínimo 2 caracteres"),
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        confirm_password: z.string(),
    })
    .refine((v) => v.password === v.confirm_password, {
        path: ["confirm_password"],
        message: "Las contraseñas no coinciden",
    });

type FormData = z.infer<typeof Schema>;

export default function RegisterForm() {
    const router = useRouter();
    const toast = useToast();
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(Schema) });

    const onSubmit = async (data: FormData) => {
        try {
            const { confirm_password, ...payload } = data;
            await requestRegisterOtp(payload as any);
            toast.success("OTP enviado a tu correo", "Verifica tu bandeja");
            router.push(`/confirm?email=${encodeURIComponent(data.email)}`);
        } catch (e) {
            toast.error(
                (e as Error).message || "No se pudo iniciar el registro",
                "Error"
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-sm font-medium">Nombre</label>
                    <input
                        className="w-full rounded-xl border bg-white p-3 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        {...register("first_name")}
                    />
                    {errors.first_name && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.first_name.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Apellido</label>
                    <input
                        className="w-full rounded-xl border bg-white p-3 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        {...register("last_name")}
                    />
                    {errors.last_name && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.last_name.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                    className="w-full rounded-xl border bg-white p-3 text-sm shadow-sm outline-none
                     focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                    autoComplete="email"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Contraseña</label>
                <div className="relative">
                    <input
                        type={showPwd ? "text" : "password"}
                        className="w-full rounded-xl border bg-white p-3 pe-11 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        autoComplete="new-password"
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-pressed={showPwd}
                        className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md border bg-white hover:bg-slate-50"
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

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Confirmar contraseña
                </label>
                <div className="relative">
                    <input
                        type={showPwd2 ? "text" : "password"}
                        className="w-full rounded-xl border bg-white p-3 pe-11 text-sm shadow-sm outline-none
                       focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                        autoComplete="new-password"
                        {...register("confirm_password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd2((v) => !v)}
                        aria-pressed={showPwd2}
                        className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md border bg-white hover:bg-slate-50"
                        title={showPwd2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPwd2 ? (
                            <IconEyeOff className="size-4 text-slate-600" />
                        ) : (
                            <IconEye className="size-4 text-slate-600" />
                        )}
                    </button>
                </div>
                {errors.confirm_password && (
                    <p className="mt-1 text-xs text-red-600">
                        {errors.confirm_password.message}
                    </p>
                )}
            </div>

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
                {isSubmitting ? "Enviando OTP…" : "Crear cuenta"}
            </button>
        </form>
    );
}
