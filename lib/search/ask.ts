import { fetchJson } from "@/lib/api/http";
import type { AskRequest, AskResponse } from "./types";

export function ask(payload: AskRequest) {
    return fetchJson<AskResponse>("search/ask/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
