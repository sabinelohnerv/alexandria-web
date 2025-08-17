"use client"

import { create } from "zustand"

interface UIState {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void

    userMenuOpen: boolean
    setUserMenuOpen: (open: boolean) => void
    toggleUserMenu: () => void
    closeAll: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    userMenuOpen: false,
    setUserMenuOpen: (open) => set({ userMenuOpen: open }),
    toggleUserMenu: () => set((s) => ({ userMenuOpen: !s.userMenuOpen })),
    closeAll: () => set({ sidebarOpen: false, userMenuOpen: false }),
}))
