"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui-old/button";
import { useState } from "react";

interface ConfirmOptions {
    title?: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmLabel?: string;
    confirmingLabel?: string;
}

/**
 * Shows a confirmation toast with Yes/No buttons
 * @param options - Configuration for the confirmation dialog
 */
export function showConfirmation({
    title = "Confirm Action",
    description,
    onConfirm,
    confirmLabel = "Delete",
    confirmingLabel = "Deleting...",
}: ConfirmOptions) {
    toast.custom(t => {
        const ConfirmationContent = () => {
            const [isDeleting, setIsDeleting] = useState(false);

            return (
                <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
                    {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
                    <p className="text-sm text-gray-600">{description}</p>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.dismiss(t)}
                            className="text-gray-700"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    await onConfirm();
                                } finally {
                                    setIsDeleting(false);
                                    toast.dismiss(t);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {confirmingLabel}
                                </span>
                            ) : (
                                confirmLabel
                            )}
                        </Button>
                    </div>
                </div>
            );
        };

        return <ConfirmationContent />;
    });
}
