import Link, { type LinkProps } from "next/link";
import { type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type LinkTextVariant = "primary" | "muted" | "accent" | "destructive";
type LinkTextSize = "sm" | "md" | "lg";

interface LinkTextProps
    extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
        LinkProps {
    variant?: LinkTextVariant;
    size?: LinkTextSize;
    external?: boolean;
}

const variantStyles: Record<LinkTextVariant, string> = {
    primary: "text-primary hover:text-primary-hover",
    muted: "text-muted-foreground hover:text-foreground",
    accent: "text-accent hover:text-accent-hover",
    destructive: "text-destructive hover:text-destructive-hover",
};

const sizeStyles: Record<LinkTextSize, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
};

export function LinkText({
    className,
    variant = "primary",
    size = "md",
    external = false,
    children,
    ...props
}: LinkTextProps) {
    return (
        <Link
            className={cn(
                "font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            {...props}
        >
            {children}
        </Link>
    );
}
