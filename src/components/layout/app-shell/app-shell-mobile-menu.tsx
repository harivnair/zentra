"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { sideMenuNav } from "@/config/nav";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/context/auth";
import { filterMenuItems } from "@/lib/utils/permissions";

export function AppShellMobileMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const filteredMenu = filterMenuItems(user, sideMenuNav);

    const close = () => setOpen(false);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            {/* Hamburger – visible only on mobile / tablet */}
            <button
                onClick={() => setOpen(v => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                )}
                onClick={close}
                aria-hidden
            />

            {/* Panel – slides down from header */}
            <div
                className={cn(
                    "fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border bg-surface shadow-xl transition-all duration-200 ease-out sm:top-16 sm:max-h-[calc(100dvh-4rem)] lg:hidden",
                    open
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-2 opacity-0 pointer-events-none",
                )}
            >
                <nav className="flex flex-col gap-4 p-4">
                    {filteredMenu.map(section => (
                        <div key={section.title}>
                            <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-1">
                                {section.items.map(item => {
                                    const active =
                                        item.href === "/dashboard"
                                            ? pathname === "/dashboard"
                                            : pathname === item.href;

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors",
                                                    active
                                                        ? "bg-primary-light text-primary"
                                                        : "text-foreground active:bg-muted",
                                                )}
                                                onClick={close}
                                            >
                                                {item.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="flex flex-col gap-3 border-t border-border p-4">
                    <div className="flex items-center justify-between px-3">
                        <span className="text-sm text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>

                    <Link
                        href="/profile"
                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground active:bg-muted"
                        onClick={close}
                    >
                        Profile
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground active:bg-muted"
                        onClick={close}
                    >
                        Settings
                    </Link>
                    <button
                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-destructive active:bg-destructive/10"
                        onClick={close}
                    >
                        Log out
                    </button>
                </div>
            </div>
        </>
    );
}
