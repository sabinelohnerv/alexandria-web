"use client"

import { useTheme } from "@/lib/theme/useTheme"

export default function ThemeToggle() {
    const { theme, toggle } = useTheme()
    const isDark = theme === "dark"

    return (
        <button
            type="button"
            onClick={toggle}
            title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
            className="rounded-lg border px-2 py-1 text-sm bg-[--card] hover:bg-black/5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand] flex items-center gap-2"
        >
            {isDark ? (
                /* Sol */
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79l1.8-1.79zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.07.05l-1.79-1.8l-1.8 1.8l1.8 1.79l1.79-1.79zM17 13h3v-2h-3v2zm-5 8h2v-3h-2v3zM4.22 19.78l1.79-1.79l-1.79-1.8l-1.79 1.8l1.79 1.79zM18 17.99l1.79 1.79l1.41-1.41l-1.79-1.79L18 17.99zM12 8a4 4 0 100 8a4 4 0 000-8z" /></svg>
            ) : (
                /* Luna */
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.74 2.01a1 1 0 0 1 .93 1.35A8 8 0 1 0 20.64 11a1 1 0 0 1 1.33-.95A10 10 0 1 1 12.74 2z" /></svg>
            )}
            <span className="hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
        </button>
    )
}
