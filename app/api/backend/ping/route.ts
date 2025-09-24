export const runtime = "nodejs";

export async function GET() {
    return new Response(JSON.stringify({ ok: true, from: "backend" }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}
