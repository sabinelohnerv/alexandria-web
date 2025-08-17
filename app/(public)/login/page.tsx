import type { Metadata } from "next";
import LoginCard from "@/components/auth/login/LoginCard";

export const metadata: Metadata = {
    title: "Iniciar sesión — Alexandria",
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
    const sp = await searchParams;

    const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next;
    const nextUrl =
        typeof rawNext === "string" && rawNext.length > 0
            ? decodeURIComponent(rawNext)
            : "/";

    const rawEmail = Array.isArray(sp.email) ? sp.email[0] : sp.email;
    const initialEmail = typeof rawEmail === "string" ? rawEmail : "";

    return (
        <main className="min-h-[100svh] grid place-items-center p-4">
            <LoginCard nextUrl={nextUrl} initialEmail={initialEmail} />
        </main>
    );
}
