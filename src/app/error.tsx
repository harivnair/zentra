"use client";

import { Button } from "@/components/ui";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <Button className="mt-8" onClick={reset}>
                Try Again
            </Button>
        </div>
    );
}
