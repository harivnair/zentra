"use client";

import React, { useState } from "react";

export interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-md ${
                        className || ""
                    }`}
                    style={{
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginBottom: "8px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {content}
                    <div
                        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-gray-900"
                        style={{ marginBottom: "-1px" }}
                    />
                </div>
            )}
        </div>
    );
}
