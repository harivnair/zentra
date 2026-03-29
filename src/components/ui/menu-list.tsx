"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    dividerAfter?: boolean;
}

export interface MenuListProps {
    items: MenuItem[];
    trigger: React.ReactNode;
    align?: "start" | "end";
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function MenuList({
    items,
    trigger,
    align = "end",
    className,
    open: controlledOpen,
    onOpenChange,
}: MenuListProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, setOpen]);

    const handleTriggerClick = () => {
        setOpen(!isOpen);
    };

    const handleItemClick = (onClick?: () => void) => {
        if (onClick) {
            onClick();
        }
        setOpen(false);
    };

    // Calculate position during render - no state needed
    const position = (() => {
        if (typeof window === "undefined" || !menuRef.current) return "bottom";
        const triggerRect = menuRef.current.getBoundingClientRect();
        const menuHeight = 200;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        // Open upward if not enough space below OR if we're in the bottom portion of viewport
        const isNearBottom = spaceBelow < menuHeight + 40;
        return (spaceBelow < menuHeight && spaceAbove > spaceBelow) || isNearBottom
            ? "top"
            : "bottom";
    })();

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={handleTriggerClick} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        "absolute w-48 rounded-xl border border-border bg-surface p-1 shadow-lg z-50",
                        position === "top" ? "bottom-full mb-2" : "top-full mt-2",
                        align === "start" ? "left-0" : "right-0",
                        className,
                    )}
                >
                    {items.map(item => (
                        <div key={item.key}>
                            <button
                                onClick={() => handleItemClick(item.onClick)}
                                disabled={item.disabled}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                                    "text-foreground hover:bg-muted",
                                    item.disabled && "pointer-events-none opacity-50",
                                    item.className,
                                )}
                            >
                                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                                {item.label}
                            </button>
                            {item.dividerAfter && <div className="my-1 border-t border-border" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
