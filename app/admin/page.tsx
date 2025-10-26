// app/admin/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Topbar from "@/components/chat/Topbar";
import WhitelistAdmin from "@/components/admin/whitelist/WhitelistAdmin";
import { serverFetch, ApiError } from "@/lib/server/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

type Me = {
    id: number;
    first_name: string;
    last_name: string;
    role: "admin" | "user";
};

export default async function AdminPage() {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;

    if (!token) {
        redirect("/login?next=/admin");
    }

    const authHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Cookie: `${ACCESS_COOKIE}=${token}`,
    };

    let user: Me;
    try {
        user = await serverFetch<Me>("/auth/me/", {
            method: "GET",
            headers: authHeaders,
        });
    } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            redirect("/login?next=/admin");
        }
        throw e;
    }

    if (user.role !== "admin") {
        redirect("/");
    }

    return (
        <>
            <Topbar user={user} />
            <main className="flex h-[calc(100svh-56px)] min-h-0 overflow-hidden bg-[var(--bg)]">
                <div className="flex-1 min-h-0 p-4 md:p-6">
                    <div className="h-full flex flex-col gap-4">
                        <header className="animate-fadeIn">
                            <h2 className="text-2xl md:text-2xl font-bold text-slate-800">
                                Panel de Administración
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Gestiona la lista de usuarios autorizados del sistema
                            </p>
                        </header>
                        <WhitelistAdmin />
                    </div>
                </div>
            </main>
        </>
    );
}
