"use client";

import { AuthProvider } from "@/context/auth";
import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
    );
}
