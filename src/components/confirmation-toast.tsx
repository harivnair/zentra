"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface ConfirmOptions {
    title?: string
    description: string
    onConfirm: () => void | Promise<void>
}

/**
 * Shows a confirmation toast with Yes/No buttons
 * @param options - Configuration for the confirmation dialog
 */
export function showConfirmation({
    title = "Confirm Action",
    description,
    onConfirm,
}: ConfirmOptions) {
    toast.custom((t) => (
        <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
            {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
            <p className="text-sm text-gray-600">{description}</p>
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.dismiss(t)}
                    className="text-gray-700"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={async () => {
                        try {
                            await onConfirm()
                        } finally {
                            toast.dismiss(t)
                        }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Delete
                </Button>
            </div>
        </div>
    ))
}
