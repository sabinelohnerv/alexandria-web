"use client";

import * as React from "react";

export default function OtpInput({
    length = 6,
    value,
    onChange,
}: {
    length?: number;
    value: string;
    onChange: (v: string) => void;
}) {
    const inputs = React.useRef<Array<HTMLInputElement | null>>([]);

    const digits = React.useMemo(() => {
        const arr = new Array(length).fill("");
        for (let i = 0; i < Math.min(value.length, length); i++) arr[i] = value[i];
        return arr;
    }, [value, length]);

    function setCharAt(index: number, ch: string) {
        const arr = digits.slice();
        arr[index] = ch;
        onChange(arr.join("").replace(/\s/g, ""));
    }

    function focusIndex(i: number) {
        const el = inputs.current[i];
        if (el) el.focus();
    }

    function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) {
            setCharAt(i, "");
            return;
        }
        // distribuir si pega varios dígitos
        const chars = raw.split("");
        for (let k = 0; k < chars.length && i + k < length; k++) {
            setCharAt(i + k, chars[k]);
        }
        const next = Math.min(i + raw.length, length - 1);
        focusIndex(next);
    }

    function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[i]) {
                setCharAt(i, "");
            } else if (i > 0) {
                focusIndex(i - 1);
                setCharAt(i - 1, "");
            }
        } else if (e.key === "ArrowLeft" && i > 0) {
            e.preventDefault();
            focusIndex(i - 1);
        } else if (e.key === "ArrowRight" && i < length - 1) {
            e.preventDefault();
            focusIndex(i + 1);
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!text) return;
        onChange(text.slice(0, length));
    }

    return (
        <div className="flex gap-2">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputs.current[i] = el; // ← devolver void, no el elemento
                    }}
                    value={d}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg rounded-lg border bg-white shadow-sm outline-none
                     focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2"
                    aria-label={`Dígito ${i + 1}`}
                    maxLength={1}
                />
            ))}
        </div>
    );
}
