"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    FileText,
    Calendar,
    Grid,
    DollarSign,
    BookOpen,
    CreditCard,
    BarChart2,
    Users,
    Truck,
    LogOut,
    Package,
    ChevronRight,
    Key,
    User,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/change-password-modal";
export default function Sidebar() {
    const pathname = usePathname() || "/";
    const router = useRouter();
    const { logout, user } = useAuth();
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const handleChangePassword = () => {
        setChangePasswordModalOpen(true);
        setUserMenuOpen(false);
    };

    const handleNavClick = (href: string) => {
        setNavigatingTo(href);
        window.dispatchEvent(new Event("nav-start"));
    };

    type NavItem = { href: string; label: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> };

    const topItems: NavItem[] = [{ href: "/dashboard", label: "Dashboard", Icon: Home }];

    const salesAndMarketing: NavItem[] = [
        { href: "/enquiries", label: "Enquiries", Icon: FileText },
        { href: "/clients", label: "Clients", Icon: Users },
        { href: "/vendors", label: "Vendors", Icon: Truck },
    ];

    const operations: NavItem[] = [
        { href: "/events", label: "Events", Icon: Calendar },
        { href: "/schedules", label: "Schedules", Icon: Grid },
        { href: "/checklists", label: "Checklists", Icon: Grid },
        { href: "/inventory", label: "Inventory", Icon: Package },
    ];

    const finance: NavItem[] = [
        { href: "/estimates", label: "Estimates", Icon: DollarSign },
        { href: "/expenses", label: "Expenses", Icon: BookOpen },
        { href: "/bills", label: "Bills", Icon: CreditCard },
        { href: "/reports", label: "Reports", Icon: BarChart2 },
    ];

    const administrations: NavItem[] = [{ href: "/users", label: "Users", Icon: User }];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    useEffect(() => {
        setNavigatingTo(null);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuOpen && !(event.target as Element).closest(".user-menu, .user-trigger")) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuOpen]);

    if (pathname === "/login" || pathname.startsWith("/login/")) return null;

    const NavLink = ({ item }: { item: NavItem }) => {
        const active = isActive(item.href);
        const loading = navigatingTo === item.href;

        return (
            <Link
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    reveal reveal-light transition-all duration-150 select-none
                    ${
                        active
                            ? "bg-black/5 text-indigo-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                    }
                `}
            >
                {/* Active indicator */}
                {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
                )}

                {item.Icon && (
                    <item.Icon
                        className={`w-4 h-4 shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                    />
                )}

                <span className="flex-1 truncate">{item.label}</span>

                {loading && (
                    <svg
                        className="animate-spin h-3.5 w-3.5 text-slate-400 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}

                {active && !loading && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
            </Link>
        );
    };

    const SectionLabel = ({ label }: { label: string }) => (
        <div className="px-3 pb-1.5">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">{label}</span>
        </div>
    );

    return (
        <aside className="hidden md:flex w-60 flex-col acrylic-light text-slate-900 py-3 px-3 fixed left-0 top-0 h-screen shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 pb-3 mb-3  border-b border-black/5">
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-black/10 shrink-0">
                    <Image src="/zentra-logo.jpg" alt="zentra" width={32} height={32} className="object-cover" />
                </div>
                <div>
                    <span className="font-semibold text-[15px] tracking-tight text-slate-900">Zentra</span>
                    <span className="block text-[10px] text-slate-500 font-normal -mt-0.5">Event Management</span>
                </div>
            </div>

            {/* Nav items */}

            <div
                className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
            >
                {topItems.map(it => (
                    <NavLink key={it.href} item={it} />
                ))}
                <SectionLabel label="Sales" />
                {salesAndMarketing.map(it => (
                    <NavLink key={it.href} item={it} />
                ))}

                <SectionLabel label="Operations" />
                {operations.map(it => (
                    <NavLink key={it.href} item={it} />
                ))}

                <SectionLabel label="Finance" />
                {finance.map(it => (
                    <NavLink key={it.href} item={it} />
                ))}
                <SectionLabel label="Administration" />
                {administrations.map(it => (
                    <NavLink key={it.href} item={it} />
                ))}
            </div>

            {/* User Menu */}
            <div className="mt-4 border-t border-black/5 pt-3 relative">
                {user && (
                    <>
                        <div
                            className="px-3 pt-2 cursor-pointer hover:bg-black/5 rounded-xl transition-colors"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 shrink-0">
                                    {(user.name || user.uid || "U")[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-900 truncate">
                                        {user.name || user.uid}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">{user.email || "Admin"}</p>
                                </div>
                            </div>
                        </div>
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-black/5 rounded-xl shadow-lg py-1 z-50 user-menu">
                                <button
                                    onClick={() => {
                                        handleChangePassword();
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-black/5 transition-colors"
                                >
                                    <Key className="w-4 h-4 shrink-0 opacity-70" />
                                    <span>Change Password</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 shrink-0 opacity-70" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <ChangePasswordModal isOpen={changePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
        </aside>
    );
}
