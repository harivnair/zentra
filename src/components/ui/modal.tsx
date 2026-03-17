"use client";

import React from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    className?: string;
}

export default function Modal({
    isOpen,
    onClose,
    children,
    header,
    footer,
    showCloseButton,
    className = "",
}: ModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-[200]"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`mt-12 md:mt-0 bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-xl w-full max-w-md shadow-2xl mx-4 md:mx-0 flex flex-col max-h-[80vh] relative ${className}`}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-10"
                        type="button"
                    >
                        ×
                    </button>
                )}
                {header && (
                    <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {header}
                    </div>
                )}
                <div className={`flex-1 overflow-y-auto ${header ? "px-6 py-4" : "p-6"}`}>{children}</div>
                {footer && (
                    <div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
