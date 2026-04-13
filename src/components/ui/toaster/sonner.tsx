"use client";

import { Toaster as SonnerToaster } from "sonner";

export type { ExternalToast } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            expand={false}
            duration={5000}
            toastOptions={{
                style: {
                    fontSize: "0.9375rem",
                },
                classNames: {
                    closeButton:
                        "!bg-white !border !border-gray-200 hover:!bg-gray-100 !text-gray-600",
                },
            }}
        />
    );
}
