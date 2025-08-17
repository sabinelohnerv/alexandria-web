"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams, useRouter } from "next/navigation"

const Schema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
})
type FormData = z.infer<typeof Schema>

export default function LoginPage() {
    const [serverError, setServerError] = useState<string>("")
    const router = useRouter()
    const sp = useSearchParams()
    const nextUrl = sp.get("next") || "/"

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(Schema) })

    const onSubmit = async (data: FormData) => {
        setServerError("")
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                const firstKey = Object.keys(err)[0]
                const message =
                    err.detail ||
                    (firstKey && Array.isArray(err[firstKey]) ? err[firstKey][0] : undefined) ||
                    "Credenciales inválidas"
                throw new Error(message)
            }

            router.push(nextUrl)
        } catch (e) {
            setServerError((e as Error).message)
        }
    }

    return (
        <main className="min-h-[100svh] grid place-items-center p-4">
            <div className="w-full max-w-md rounded-2xl border bg-[--card] shadow-xl overflow-hidden">
                {/* Header brand */}
                <div className="relative">
                    <div
                        className="h-24 w-full"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 70%, #ffffff) 100%)",
                        }}
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                        <div className="size-16 rounded-2xl grid place-items-center shadow-lg ring-4 ring-white/80"
                            style={{ background: "var(--brand)" }}>
                            {/* logo simple */}
                            <svg width="26" height="26" viewBox="0 0 24 24" className="text-white">
                                <path fill="currentColor" d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3zm0 2.1L5 8v8l7 3.5L19 16V8l-7-2.9zM9 10h6v2H9v-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-6 pt-12 pb-6">
                    <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>
                    <p className="mt-1 text-center text-sm text-[--muted]">
                        Bienvenido(a) a <span className="font-medium" style={{ color: "var(--brand)" }}>Alexandria</span>
                    </p>

                    {serverError && (
                        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Email</label>
                            <input
                                className="w-full rounded-xl border bg-white/80 p-3 text-sm shadow-sm outline-none
                           focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                                placeholder="tucorreo@dominio.com"
                                autoComplete="username"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Contraseña</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border bg-white/80 p-3 text-sm shadow-sm outline-none
                           focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
                            {isSubmitting ? "Ingresando…" : "Entrar"}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs text-[--secondary]">
                        <a className="hover:underline" href="/register">Crear cuenta</a>
                        <a className="hover:underline" href="/password-reset">¿Olvidaste tu contraseña?</a>
                    </div>
                </div>
            </div>
        </main>
    )
}
