"use client";

let draftSeq = 1;
export function nextDraftId() {
    return -draftSeq++;
}
