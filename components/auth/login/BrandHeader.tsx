"use client";
import Image from "next/image";

export default function BrandHeader() {
    return (
        <div className="relative">
            <div
                className="h-24 w-full"
                style={{
                    background:
                        "linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 70%, #ffffff) 100%)",
                }}
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <div
                    className="size-16 rounded-2xl grid place-items-center shadow-lg ring-4 ring-white/80 brand-badge"
                    title="Alexandria"
                >
                    <Image
                        src="/brand/logo-mark.svg"
                        alt="Alexandria"
                        width={52}
                        height={52}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
