import { NextResponse } from "next/server";
import { serverFetch, ApiError } from "@/lib/server/api";
import { buildAuthHeaders } from "../../helpers";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    try {
        const headers = await buildAuthHeaders();
        const input = await req.json();

        const updated = await serverFetch(`/whitelist/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(input),
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (e) {
        if (e instanceof ApiError) {
            try {
                const json = e.json ?? JSON.parse(e.body ?? "{}");
                return NextResponse.json(json, { status: e.status });
            } catch {
                return NextResponse.json({ detail: e.body || "Error" }, { status: e.status });
            }
        }
        return NextResponse.json({ detail: "Unexpected error" }, { status: 500 });
    }
}
