"use client";
import * as React from "react";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string;
    height?: string;
}

export default function Skeleton({
    className = "",
    variant = "text",
    width,
    height,
}: SkeletonProps) {
    const baseClasses = "animate-pulse bg-slate-200";
    
    const variantClasses = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-t border-slate-200">
            <td className="p-3 border-r border-slate-200">
                <Skeleton width="24px" height="16px" />
            </td>
            <td className="p-3 border-r border-slate-200">
                <Skeleton width="80%" height="16px" />
            </td>
            <td className="p-3 border-r border-slate-200">
                <Skeleton width="90%" height="16px" />
            </td>
            <td className="p-3 border-r border-slate-200">
                <Skeleton width="60px" height="16px" />
            </td>
            <td className="p-3 border-r border-slate-200">
                <Skeleton width="60px" height="16px" />
            </td>
            <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Skeleton variant="circular" width="32px" height="32px" />
                    <Skeleton variant="circular" width="32px" height="32px" />
                </div>
            </td>
        </tr>
    );
}

export function CardSkeleton() {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <Skeleton width="70%" height="20px" />
                <Skeleton variant="rectangular" width="60px" height="20px" />
            </div>
            <Skeleton width="85%" height="14px" />
            <div className="flex items-center justify-between pt-1">
                <Skeleton width="50px" height="14px" />
                <div className="flex gap-2">
                    <Skeleton variant="circular" width="32px" height="32px" />
                    <Skeleton variant="circular" width="32px" height="32px" />
                </div>
            </div>
        </div>
    );
}
