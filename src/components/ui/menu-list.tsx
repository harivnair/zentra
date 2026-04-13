"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const portalRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<"top" | "bottom">("bottom");
    const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const isInsideMenu = menuRef.current?.contains(e.target as Node);
            const isInsidePortal = portalRef.current?.contains(e.target as Node);
            if (!isInsideMenu && !isInsidePortal) {
                setOpen(false);
            }
        }
        function handleScroll(e: Event) {
            const isInsideMenu = menuRef.current?.contains(e.target as Node);
            const isInsidePortal = portalRef.current?.contains(e.target as Node);
            if (!isInsideMenu && !isInsidePortal) {
                setOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("scroll", handleScroll, true);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen, setOpen]);

    useEffect(() => {
        if (isOpen && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            setTriggerRect(rect);
            const menuHeight = 200;
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const isNearBottom = spaceBelow < menuHeight + 40;
            setPosition(
                (spaceBelow < menuHeight && spaceAbove > spaceBelow) || isNearBottom
                    ? "top"
                    : "bottom",
            );
        }
    }, [isOpen]);

    const handleTriggerClick = () => {
        setOpen(!isOpen);
    };

    const handleItemClick = (onClick?: () => void) => {
        if (onClick) {
            onClick();
        }
        setOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={handleTriggerClick} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen &&
                triggerRect &&
                createPortal(
                    <div
                        ref={portalRef}
                        className={cn(
                            "fixed w-48 rounded-md border border-border bg-surface p-1 shadow-lg z-[100]",
                            className,
                        )}
                        style={{
                            top: position === "bottom" ? triggerRect.bottom + 8 : undefined,
                            bottom:
                                position === "top"
                                    ? window.innerHeight - triggerRect.top + 8
                                    : undefined,
                            left: align === "start" ? triggerRect.left : undefined,
                            right:
                                align === "end" ? window.innerWidth - triggerRect.right : undefined,
                        }}
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
                                    {item.icon && (
                                        <span className="flex-shrink-0">{item.icon}</span>
                                    )}
                                    {item.label}
                                </button>
                                {item.dividerAfter && (
                                    <div className="my-1 border-t border-border" />
                                )}
                            </div>
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
