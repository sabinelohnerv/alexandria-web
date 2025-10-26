"use client";

import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function Alert({
    kind = "info",
    title,
    message,
    showIcon = true,
    onRetry,
}: {
    kind?: "info" | "error" | "success" | "warning";
    title?: string;
    message: string;
    showIcon?: boolean;
    onRetry?: () => void;
}) {
    const config = {
        error: {
            styles: "border-red-300 bg-red-50 text-red-700",
            Icon: AlertCircle,
        },
        success: {
            styles: "border-emerald-300 bg-emerald-50 text-emerald-700",
            Icon: CheckCircle,
        },
        warning: {
            styles: "border-amber-300 bg-amber-50 text-amber-700",
            Icon: AlertTriangle,
        },
        info: {
            styles: "border-sky-300 bg-sky-50 text-sky-700",
            Icon: Info,
        },
    };

    const { styles, Icon } = config[kind];

    return (
        <div className={`rounded-lg border p-3 text-sm ${styles}`}>
            <div className="flex gap-2">
                {showIcon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                    {title && <div className="font-semibold mb-0.5">{title}</div>}
                    <div>{message}</div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 text-xs font-medium underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
