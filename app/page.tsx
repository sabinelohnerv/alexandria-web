import { cookies } from "next/headers"
import { getBaseUrl } from "@/lib/next/urls"
import Sidebar from "@/components/chat/Sidebar"
import Topbar from "@/components/chat/Topbar"
import ChatWindow from "@/components/chat/ChatWindow"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const base = await getBaseUrl()

    const cookieHeader = (await cookies())
        .getAll()
        .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ")

    const res = await fetch(`${base}/api/auth/me`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    })

    if (!res.ok) {
        return (
            <main className="min-h-[100svh] grid place-items-center p-6">
                <div className="rounded-xl border bg-white p-6 text-center">
                    <p>Sesión expirada.</p>
                    <a className="mt-2 inline-block underline" href="/login">Volver a login</a>
                </div>
            </main>
        )
    }

    const { user } = await res.json()

    return (
        <>
            <Topbar user={user} />
            <main className="flex h-[calc(100svh-56px)] min-h-0 overflow-hidden">
                <Sidebar />
                <div className="flex-1 min-h-0">
                    <ChatWindow />
                </div>
            </main>
        </>
    )
}
