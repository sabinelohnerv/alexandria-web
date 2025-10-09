"use client";
import React from "react";

type Props = React.PropsWithChildren<{
    className?: string;
}>;

export default function MessageShell({ className, children }: Props) {
    return (
        <div className={["max-w-[80%] bg-white border rounded-2xl p-4 pt-6 pr-16 shadow-sm group relative", className || ""].join(" ")}>
            {children}
        </div>
    );
}
