"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { XIcon } from "@/components/ui/icons";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: ModalSize;
    title?: string;
    description?: string;
    className?: string;
    closeOnBackdrop?: boolean;
    showCloseIcon?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
};

export function Modal({
    open,
    onClose,
    children,
    size = "md",
    title,
    description,
    className,
    closeOnBackdrop = false,
    showCloseIcon = false,
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && dialogRef.current) {
            const focusable = dialogRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            focusable?.focus();
        }
    }, [open]);

    if (!open) return null;

    function handleBackdropClick() {
        if (closeOnBackdrop && open) onClose();
    }

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-desc" : undefined}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                aria-hidden
            />

            {/* Panel */}
            <div
                ref={dialogRef}
                className={cn(
                    "relative z-10 w-full rounded-xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 fade-in duration-200",
                    sizeStyles[size],
                    className,
                )}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                        <div>
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-base font-semibold text-foreground sm:text-lg"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-desc" className="mt-0.5 text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseIcon && (
                            <button
                                onClick={onClose}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                                aria-label="Close"
                            >
                                <XIcon size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className={cn(!title && !description && "pt-0")}>{children}</div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

interface ModalBodyProps {
    children: ReactNode;
    className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
    return <div className={cn("px-5 py-4 sm:px-6", className)}>{children}</div>;
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6",
                className,
            )}
        >
            {children}
        </div>
    );
}
