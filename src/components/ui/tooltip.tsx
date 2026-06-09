"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 8,
                left: rect.left + rect.width / 2,
            });
        }
    }, [isVisible]);

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible &&
                createPortal(
                    <div
                        className={cn(
                            "fixed z-[9999] max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground shadow-xl",
                            className,
                        )}
                        style={{
                            top: position.top,
                            left: position.left,
                            transform: "translateX(-50%) translateY(-100%)",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                        }}
                    >
                        {content}
                        <div
                            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-border"
                            style={{ marginBottom: "-1px" }}
                        />
                        <div
                            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-surface"
                            style={{ marginBottom: "0px", marginTop: "-1px" }}
                        />
                    </div>,
                    document.body,
                )}
        </div>
    );
}
