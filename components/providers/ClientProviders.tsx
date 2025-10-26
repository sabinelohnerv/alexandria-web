"use client";

import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { useEffect } from "react";
import { setupErrorSuppressor } from "@/lib/api/errorSuppressor";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Configurar supresor de errores de validación de contenido
        setupErrorSuppressor();
    }, []);

    return <ToastProvider>{children}</ToastProvider>;
}
