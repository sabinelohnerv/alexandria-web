"use client";
export default function Header({ title }: { title?: string }) {
    return title ? <h4 className="font-semibold mb-1">{title}</h4> : null;
}
