/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

/* =======================
   Tipos polimórficos
======================= */
type AsProp<T extends React.ElementType> = { as?: T };
type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P);

type PolymorphicComponentProps<T extends React.ElementType, P> =
    React.PropsWithChildren<P & AsProp<T>> &
    Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, P>>;

type PolymorphicRef<T extends React.ElementType> =
    React.ComponentPropsWithRef<T>["ref"];

/* =======================
   API del Chip
======================= */
type Variant = "soft" | "solid" | "outline";
type Tone = "brand" | "slate" | "green" | "red" | "amber" | "blue" | "violet";
type Size = "sm" | "md";

type OwnProps = {
    title?: string;
    className?: string;
    variant?: Variant;
    color?: Tone;
    size?: Size;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
};

export type ChipProps<T extends React.ElementType = "span"> =
    PolymorphicComponentProps<T, OwnProps>;

/* =======================
   Estilos helpers
======================= */
function cx(...parts: Array<string | undefined | false>) {
    return parts.filter(Boolean).join(" ");
}

const sizeClasses: Record<Size, string> = {
    sm: "px-1.5 py-[2px] text-[11.5px] leading-[1.05] gap-1",
    md: "px-2 py-[3px] text-[12.5px] leading-[1.05] gap-1.5",
};

const toneClasses = (tone: Tone, variant: Variant) => {
    if (tone === "brand") {
        const base = {
            soft:
                "bg-[color:var(--brand,#023f66)]/10 text-[color:var(--brand,#023f66)] border border-[color:var(--brand,#023f66)]/20",
            solid:
                "bg-[color:var(--brand,#023f66)] text-white border border-[color:var(--brand,#023f66)]",
            outline:
                "bg-transparent text-[color:var(--brand,#023f66)] border border-[color:var(--brand,#023f66)]",
        } as const;
        return base[variant];
    }
    const map: Record<Exclude<Tone, "brand">, { soft: string; solid: string; outline: string }> = {
        slate: {
            soft: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
            solid: "bg-slate-700 text-white border border-slate-700",
            outline: "bg-transparent text-slate-700 border border-slate-500",
        },
        green: {
            soft: "bg-green-600/10 text-green-700 border border-green-600/20",
            solid: "bg-green-600 text-white border border-green-600",
            outline: "bg-transparent text-green-700 border border-green-600",
        },
        red: {
            soft: "bg-red-600/10 text-red-700 border border-red-600/20",
            solid: "bg-red-600 text-white border border-red-600",
            outline: "bg-transparent text-red-700 border border-red-600",
        },
        amber: {
            soft: "bg-amber-500/15 text-amber-800 border border-amber-500/30",
            solid: "bg-amber-500 text-amber-950 border border-amber-500",
            outline: "bg-transparent text-amber-700 border border-amber-500",
        },
        blue: {
            soft: "bg-blue-600/10 text-blue-700 border border-blue-600/20",
            solid: "bg-blue-600 text-white border border-blue-600",
            outline: "bg-transparent text-blue-700 border border-blue-600",
        },
        violet: {
            soft: "bg-violet-600/10 text-violet-700 border border-violet-600/20",
            solid: "bg-violet-600 text-white border border-violet-600",
            outline: "bg-transparent text-violet-700 border border-violet-600",
        },
    };
    return map[tone as Exclude<Tone, "brand">][variant];
};

/* =======================
   Implementación base (no genérica)
   -> ref nativo a <span> para satisfacer forwardRef
======================= */
const ChipBase = React.forwardRef<HTMLSpanElement, ChipProps<"span">>(function ChipBase(
    {
        children,
        title,
        className,
        as,
        variant = "soft",
        color = "brand",
        size = "sm",
        startAdornment,
        endAdornment,
        ...rest
    },
    ref
) {
    const Tag = (as || "span") as React.ElementType;

    return (
        <Tag
            // ref tipado a span en la base; al cambiar "as" lo re-tipamos en la firma pública
            ref={ref as React.Ref<any>}
            title={title}
            className={cx(
                "inline-flex items-center align-baseline whitespace-nowrap select-none",
                "rounded-md transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[color:var(--brand,#023f66)]/50",
                "hover:brightness-[0.98]",
                toneClasses(color, variant),
                sizeClasses[size],
                className
            )}
            {...rest}
        >
            {startAdornment && <span className="shrink-0 -ml-0.5">{startAdornment}</span>}
            <span className="truncate">{children}</span>
            {endAdornment && <span className="shrink-0 -mr-0.5">{endAdornment}</span>}
        </Tag>
    );
});

/* =======================
   Re-exposición genérica (firma polimórfica)
======================= */
type ChipComponent = <
    T extends React.ElementType = "span"
>(
    props: ChipProps<T> & { ref?: PolymorphicRef<T> }
) => React.ReactElement | null;

const Chip = ChipBase as unknown as ChipComponent;

export default Chip;
