import type { Metadata } from "next";
import RegisterCard from "@/components/auth/register/RegisterCard";

export const metadata: Metadata = { title: "Crear cuenta — Alexandria" };

export default function Page() {
    return (
        <main className="min-h-[100svh] grid place-items-center p-4">
            <RegisterCard />
        </main>
    );
}
