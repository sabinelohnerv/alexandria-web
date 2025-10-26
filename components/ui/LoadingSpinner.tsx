"use client";
import * as React from "react";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizeMap = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <svg
            className={`${sizeMap[size]} ${className} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

export function LoadingDots({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
        </div>
    );
}

export function LoadingPulse({ className = "" }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <div className="w-12 h-12 rounded-full border-4 border-[var(--brand)] opacity-20 absolute animate-ping" />
            <div className="w-12 h-12 rounded-full border-4 border-[var(--brand)] opacity-40" />
        </div>
    );
}
