/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchJson } from "@/lib/api/http"

export default async function TestBackendPage() {
    let result: unknown
    let error: string | null = null

    try {
        result = await fetchJson<any>("whitelist/")
    } catch (e) {
        error = (e as Error).message
    }

    return (
        <main className="mx-auto max-w-2xl p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Test conexión backend</h1>
            <div className="rounded-xl border p-4">
                <p><b>BASE:</b> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
                <p><b>Proxy:</b> /_backend/</p>
            </div>

            {error ? (
                <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>
            ) : (
                <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            )}
        </main>
    )
}
