"use client";

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
                    className="size-16 rounded-2xl grid place-items-center shadow-lg ring-4 ring-white/80"
                    style={{ background: "var(--brand)" }}
                    title="Alexandria"
                >
                    {/* Logo simple */}
                    <svg width="26" height="26" viewBox="0 0 24 24" className="text-white">
                        <path
                            fill="currentColor"
                            d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3zm0 2.1L5 8v8l7 3.5L19 16V8l-7-2.9zM9 10h6v2H9v-2z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
