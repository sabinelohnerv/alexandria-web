/* system/SourcesSection.ts */
import {
    getHitFileUrl,
    type SearchHitDTO,
    normalizeDocType,
} from "@/lib/search/hits";

type BuildOpts = {
    includeSnippet?: boolean;
    numbered?: boolean;
    showGuide?: boolean;
};

export function buildSourcesSectionMarkdown(
    hits: SearchHitDTO[],
    sessionId: number,
    messageId: number,
    opts: BuildOpts = {}
): string {
    if (!hits?.length) return "";

    const {
        includeSnippet = false,
        numbered = true,
        showGuide = true,
    } = opts;

    const lines: string[] = [];
    lines.push(`#### **Fuentes:**`);
    lines.push("");
    if (showGuide) lines.push("");

    for (let i = 0; i < hits.length; i++) {
        const h = hits[i];
        const url = getHitFileUrl(sessionId, messageId, h.id);

        const authority = (h.document?.authority ?? "").trim();
        const docType = normalizeDocType(h.document?.doc_type);
        const number = (h.document?.number ?? "").trim();

        const leftParts = [docType].filter(Boolean).join(" · ");
        const chipLabel = [authority, number ? `Nº ${number}` : ""]
            .filter(Boolean)
            .join(" ");

        const chipLink = `[\\\`${chipLabel}\\\`](${url})`;

        const bullet = numbered ? `${i + 1}.` : "-";
        const left = leftParts ? `${leftParts} — ` : "";

        lines.push(`${bullet} ${left}${chipLink}`);

        if (includeSnippet && h.snippet) {
            lines.push(`   > ${escapeInline(h.snippet)}`);
        }
        if (i !== hits.length - 1) lines.push("");
    }

    return lines.join("\n");
}

function escapeInline(s: string) {
    return String(s)
        .replace(/`/g, "\\`")
        .replace(/\*/g, "\\*")
        .replace(/_/g, "\\_")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .trim();
}
