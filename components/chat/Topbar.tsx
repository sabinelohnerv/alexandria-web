/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef } from "react"
import { useUIStore } from "@/lib/ui/store"
import { HOME_PATH } from "@/lib/appPaths"

type UserLike = { first_name: string; last_name: string; role: "admin" | "user" }
type Props = { user?: UserLike }

export default function Topbar({ user }: Props) {
    const { toggleSidebar, userMenuOpen, toggleUserMenu, setUserMenuOpen, closeAll } = useUIStore()
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!userMenuOpen) return
            const el = menuRef.current
            if (el && !el.contains(e.target as Node)) setUserMenuOpen(false)
        }
        function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setUserMenuOpen(false) }
        document.addEventListener("mousedown", onDocClick)
        document.addEventListener("keydown", onEsc)
        return () => {
            document.removeEventListener("mousedown", onDocClick)
            document.removeEventListener("keydown", onEsc)
        }
    }, [userMenuOpen, setUserMenuOpen])

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        window.location.href = "/login"
    }

    const initials = `${user?.first_name?.[0] ?? "U"}${user?.last_name?.[0] ?? ""}`.toUpperCase()
    const displayName = user ? `${user.first_name} ${user.last_name}` : "Invitado"
    const isAdmin = user?.role === "admin"

    return (
        <header className="sticky top-0 z-[60] h-14 border-b bg-white flex items-center gap-2">
            {/* Hamburguesa */}
            <div className="px-2 md:hidden">
                <button
                    type="button"
                    aria-label="Abrir/cerrar menú"
                    onClick={toggleSidebar}
                    className="rounded-lg border px-2 py-2 bg-white text-slate-900 hover:bg-slate-100
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
                    </svg>
                </button>
            </div>

            {/* Brand */}
            <a href={HOME_PATH} className="flex items-center gap-2 px-2 md:px-3">
                <img
                    src="/brand/logo-full.svg"
                    alt="Alexandria"
                    width={170}
                    decoding="async"
                />
            </a>

            <div className="ms-auto flex items-center gap-3 px-2 md:px-4 relative" ref={menuRef}>
                {isAdmin && (
                    <a
                        href="/admin"
                        className="rounded-lg px-3 py-1 text-sm font-medium text-white"
                        style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-600) 100%)" }}
                        title="Panel de administrador"
                    >
                        Admin Panel
                    </a>
                )}

                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border px-3 py-1 text-sm bg-white hover:bg-slate-100
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
                    onClick={toggleUserMenu}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                >
                    <span
                        className="grid place-items-center size-6 rounded-md text-white text-[11px] font-semibold"
                        style={{ background: "var(--brand)" }}
                        aria-hidden
                    >
                        {initials}
                    </span>
                    <span className="select-text">{displayName}</span>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        className={`text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                        aria-hidden
                    >
                        <path fill="currentColor" d="M7 10l5 5 5-5z" />
                    </svg>
                </button>

                {userMenuOpen && (
                    <div role="menu" className="absolute right-2 top-12 z-[70] w-48 rounded-xl border bg-white overflow-hidden">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-slate-100
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand]"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>

            <button type="button" onClick={closeAll} className="hidden" aria-hidden />
        </header>
    )
}
