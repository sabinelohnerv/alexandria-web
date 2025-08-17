import type { Metadata } from "next";
import RequestResetCard from "@/components/auth/password/RequestResetCard";

export const metadata: Metadata = { title: "Recuperar contraseña — Alexandria" };

export default function Page() {
    return (
        <main className="min-h-[100svh] grid place-items-center p-4">
            <RequestResetCard />
        </main>
    );
}
