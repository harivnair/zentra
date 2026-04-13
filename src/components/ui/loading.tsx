import { cn } from "@/lib/utils/cn";

export interface LoadingProps {
    className?: string;
}

export function Loading({ className }: LoadingProps) {
    return (
        <div className={cn("flex items-center justify-center", "h-full w-full", className)}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
    );
}
