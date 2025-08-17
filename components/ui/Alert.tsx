"use client";

export default function Alert({
    kind = "info",
    title,
    message,
}: {
    kind?: "info" | "error" | "success";
    title?: string;
    message: string;
}) {
    const styles =
        kind === "error"
            ? "border-red-300 bg-red-50 text-red-700"
            : kind === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-sky-300 bg-sky-50 text-sky-700";

    return (
        <div className={`rounded-lg border p-3 text-sm ${styles}`}>
            {title && <div className="font-semibold mb-0.5">{title}</div>}
            <div>{message}</div>
        </div>
    );
}
