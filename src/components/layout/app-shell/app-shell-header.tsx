"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { AppShellMobileMenu } from "./app-shell-mobile-menu";
import { KeyRoundIcon, LogOutIcon, type IconProps } from "@/components/ui/icons";
import { userMenuNav } from "@/config/nav";

import { UserIcon, SettingsIcon } from "@/components/ui/icons";
import { NotificationPanel } from "@/components/shared/notification-panel";
import { ChangePasswordModal } from "@/components/shared/change-password-modal";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

const navIcons: Record<string, (props: IconProps) => React.JSX.Element> = {
    User: UserIcon,
    Settings: SettingsIcon,
};

export function AppShellHeader() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-sm">
                <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
                    {/* Left: Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl"
                    >
                        <Image
                            src="/logo.svg"
                            alt={`${siteConfig.name} logo`}
                            width={28}
                            height={28}
                            className="shrink-0 sm:h-8 sm:w-8"
                        />
                        <span className="xs:inline">{siteConfig.name}</span>
                    </Link>

                    {/* Right: Notification + Theme + User avatar + Mobile hamburger */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <NotificationPanel />

                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>

                        {/* User avatar / dropdown */}
                        <div className="relative hidden md:block" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(v => !v)}
                                className="cursor-pointer"
                                aria-label="User menu"
                            >
                                <Avatar useDefaultColor name={user?.name || "U"} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface p-1 shadow-lg">
                                    {userMenuNav.map(item => {
                                        const Icon = navIcons[item.icon || ""];
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMenuOpen(false)}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                                            >
                                                {Icon && <Icon size={16} />}
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setChangePasswordOpen(true);
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer"
                                    >
                                        <KeyRoundIcon size={16} />
                                        Change Password
                                    </button>
                                    <div className="my-1 border-t border-border" />
                                    <button
                                        onClick={handleLogout}
                                        className="cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <LogOutIcon size={16} />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>

                        <AppShellMobileMenu />
                    </div>
                </div>
            </header>

            <ChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </>
    );
}
