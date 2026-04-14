"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { sideMenuNav } from "@/config/nav";
import { useAuth } from "@/context/auth";
import { filterMenuItems } from "@/lib/utils/permissions";
import {
    DashboardIcon,
    MessageSquareIcon,
    UsersIcon,
    StoreIcon,
    CalendarIcon,
    ClockIcon,
    CheckSquareIcon,
    PackageIcon,
    FileTextIcon,
    WalletIcon,
    ReceiptIcon,
    BarChartIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    type IconProps,
} from "@/components/ui/icons";

const navIcons: Record<string, (props: IconProps) => React.JSX.Element> = {
    LayoutDashboard: DashboardIcon,
    MessageSquare: MessageSquareIcon,
    Users: UsersIcon,
    Store: StoreIcon,
    Calendar: CalendarIcon,
    Clock: ClockIcon,
    CheckSquare: CheckSquareIcon,
    Package: PackageIcon,
    FileText: FileTextIcon,
    Wallet: WalletIcon,
    Receipt: ReceiptIcon,
    BarChart: BarChartIcon,
    User: UserIcon,
};

export function AppShellSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const filteredMenu = filterMenuItems(user, sideMenuNav);

    return (
        <aside
            className={cn(
                "hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-100 ease-in-out lg:flex",
                collapsed ? "w-[68px]" : "w-64",
            )}
        >
            <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
                {filteredMenu.map(section => (
                    <div key={section.title}>
                        {!collapsed && (
                            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {section.title}
                            </h3>
                        )}
                        <ul className="flex flex-col gap-1">
                            {section.items.map(item => {
                                const active =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname === item.href;

                                const Icon = navIcons[item.icon || ""];

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            title={collapsed ? item.title : undefined}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                                                collapsed && "justify-center",
                                                !collapsed && "px-3",
                                                active
                                                    ? "bg-primary-light text-primary"
                                                    : "text-muted-foreground hover:bg-surface hover:text-foreground",
                                            )}
                                        >
                                            {Icon && <Icon size={18} />}
                                            {!collapsed && <span>{item.title}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex shrink-0 items-center justify-center border-t border-border p-3 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
            </button>
        </aside>
    );
}
