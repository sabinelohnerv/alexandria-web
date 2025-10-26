"use client";
import MessageShell from "./system/MessageShell";
import Avatar from "./system/Avatar";


export default function AssistantThinking() {
    return (
        
            <MessageShell>
                <div className="flex items-start gap-3">
                    <Avatar />
                    <div
                        className="max-w-3xl w-full animate-pulse"
                        aria-live="polite"
                        aria-label="El asistente está procesando la consulta"
                    >
                        <div className="flex-1">
                            <div className="h-4 w-24 rounded bg-slate-200 mb-3" />
                            {/* Líneas simuladas */}
                            <div className="space-y-2">
                                <div className="h-3 w-[90%] rounded bg-slate-200" />
                                <div className="h-3 w-[75%] rounded bg-slate-200" />
                                <div className="h-3 w-[60%] rounded bg-slate-200" />
                            </div>

                            <div className="mt-3 text-xs text-slate-500 not-italic">
                                Recopilando información...
                            </div>
                        </div>
                    </div>
                </div>
            </MessageShell>

        
    );
}
