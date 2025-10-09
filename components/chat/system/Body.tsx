"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { makeMarkdownComponents } from "./markdown";

export default function Body({ content }: { content: string }) {
    const md = makeMarkdownComponents();
    return (
        <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-code:before:content-[''] prose-code:after:content-['']">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
