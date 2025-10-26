"use client"

import { Toaster as SonnerToaster } from "sonner"

export type { ExternalToast } from "sonner"

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            expand={false}
            toastOptions={{
                style: {
                    fontSize: "0.875rem",
                },
            }}
        />
    )
}
