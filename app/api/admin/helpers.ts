import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";


export async function buildAuthHeaders(): Promise<Record<string, string>> {
    const ck = await cookies(); 
    const access = ck.get(ACCESS_COOKIE)?.value;
    const refresh = ck.get(REFRESH_COOKIE)?.value;

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (access) headers.Authorization = `Bearer ${access}`;

    const cookieParts: string[] = [];
    if (access) cookieParts.push(`${ACCESS_COOKIE}=${access}`);
    if (refresh) cookieParts.push(`${REFRESH_COOKIE}=${refresh}`);
    if (cookieParts.length) headers.Cookie = cookieParts.join("; ");

    return headers;
}
