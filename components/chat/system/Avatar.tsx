"use client";
import Image from "next/image";

export default function Avatar() {
    return (
        <div
            aria-hidden
            className="mt-1 grid place-items-center rounded-full border size-8 text-[--brand]"
            style={{ borderColor: "var(--brand)" }}
            title="Sistema"
        >
            <Image src="/brand/logo-mark.svg" alt="Sistema" width={32} height={32} priority />
        </div>
    );
}
