import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "bordered" | "elevated";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg bg-surface sm:rounded-xl",
                variant === "bordered" && "border border-border",
                variant === "elevated" && "shadow-md",
                variant === "default" && "border border-border shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("px-4 py-3 border-b border-border sm:px-6 sm:py-4", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("px-4 py-3 sm:px-6 sm:py-4", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("px-4 py-3 border-t border-border sm:px-6 sm:py-4", className)}
            {...props}
        >
            {children}
        </div>
    );
}
