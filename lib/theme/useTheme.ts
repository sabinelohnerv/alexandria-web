"use client"

import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof document === "undefined") return "light"
        return (document.documentElement.dataset.theme as Theme) || "light"
    })

    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => {
            const ls = localStorage.getItem("theme")
            if (ls === "light" || ls === "dark") return
            const sys = mql.matches ? "dark" : "light"
            document.documentElement.dataset.theme = sys
            setTheme(sys)
        }
        mql.addEventListener?.("change", onChange)
        return () => mql.removeEventListener?.("change", onChange)
    }, [])

    const apply = (t: Theme) => {
        document.documentElement.dataset.theme = t
        localStorage.setItem("theme", t)
        setTheme(t)
    }

    const toggle = () => apply(theme === "light" ? "dark" : "light")

    return { theme, setTheme: apply, toggle }
}
