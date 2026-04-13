"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { landingMainNav } from "@/config/nav";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function LandingMobileMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        close();
    }, [pathname, close]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(v => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={close}
                aria-hidden
            />

            {/* Panel */}
            <div
                className={cn(
                    "fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-surface shadow-xl transition-all duration-200 ease-out md:hidden",
                    open
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-2 opacity-0 pointer-events-none"
                )}
            >
                <nav className="flex flex-col gap-1 p-4">
                    {landingMainNav.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary-light text-primary"
                                    : "text-foreground active:bg-muted"
                            )}
                            onClick={close}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col gap-3 border-t border-border p-4">
                    <div className="flex items-center justify-between px-3">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground active:bg-muted"
                        onClick={close}
                    >
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="flex items-center justify-center rounded-lg bg-primary px-3 py-3 text-base font-medium text-primary-foreground active:bg-primary-hover"
                        onClick={close}
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </>
    );
}
