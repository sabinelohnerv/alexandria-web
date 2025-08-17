import type { Metadata } from "next";
import ConfirmResetCard from "@/components/auth/password/ConfirmResetCard";

export const metadata: Metadata = { title: "Confirmar código — Alexandria" };

type SP = Promise<Record<string, string | string[] | undefined>>;
export default async function Page({ searchParams }: { searchParams: SP }) {
    const sp = await searchParams;
    const rawEmail = Array.isArray(sp.email) ? sp.email[0] : sp.email;
    const email = typeof rawEmail === "string" ? rawEmail : "";

    return (
        <main className="min-h-[100svh] grid place-items-center p-4">
            <ConfirmResetCard email={email} />
        </main>
    );
}
