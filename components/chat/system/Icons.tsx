"use client";
import React from "react";

export const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
);

export const ThumbUp = ({ active }: { active?: boolean }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M14 9V5a3 3 0 0 0-3-3l-1 7H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9a3 3 0 0 0 3-3v-6a2 2 0 0 0-2-2h-1z" />
    </svg>
);

export const ThumbDown = ({ active }: { active?: boolean }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M10 15v4a3 3 0 0 0 3 3l1-7h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-9a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1z" />
    </svg>
);

export const IconResults = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <path d="M4 5h16M4 12h16M4 19h10" />
    </svg>
);
