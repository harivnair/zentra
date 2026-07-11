"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { CopyIcon } from "./icons";

interface CopyButtonProps {
    text: string | number;
    label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(String(text));
            toast.success(label ? `${label} copied` : "Copied to clipboard");
        } catch {
            toast.error("Failed to copy");
        }
    }, [text, label]);

    return (
        <button
            onClick={handleCopy}
            className="ml-1.5 inline-flex items-center justify-center rounded p-0.5 text-muted-foreground opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label={`Copy ${label || "value"}`}
        >
            <CopyIcon size={14} />
        </button>
    );
}
