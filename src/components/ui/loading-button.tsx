"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Spinner = () => (
    <svg
        className="animate-spin h-4 w-4 mr-1"
        viewBox="0 0 24 24"
        aria-hidden
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
        />
    </svg>
)

export interface LoadingButtonProps
    extends Omit<React.ComponentProps<typeof Button>, "children"> {
    loading?: boolean
    loadingLabel?: React.ReactNode
    children: React.ReactNode
    type?: "button" | "submit" | "reset"
}

/**
 * Button that shows a spinner and optional loading label when loading.
 * Disabled while loading. Reusable for submit actions (e.g. login, forgot-password).
 */
function LoadingButton({
    loading = false,
    loadingLabel,
    children,
    className,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            type="submit"
            className={cn("w-full", className)}
            disabled={disabled ?? loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    {loadingLabel ?? children}
                </span>
            ) : (
                children
            )}
        </Button>
    )
}

export { LoadingButton }
