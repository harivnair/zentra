import { Scope } from "@/types/auth";

export interface NavItem {
    title: string;
    href: string;
    icon?: string;
    disabled?: boolean;
    external?: boolean;
    badge?: string;
    scope?: Scope[]; // Optional scopes required to view this nav item
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const landingMainNav: NavItem[] = [
    { title: "Home", href: "/" },
    { title: "Events", href: "/events" },
];

export const userMenuNav: NavItem[] = [
    { title: "Profile", href: "/profile", icon: "User" },
    { title: "Settings", href: "/settings", icon: "Settings" },
];

export const sideMenuNav: NavSection[] = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: "LayoutDashboard",
                scope: ["r:dashboard"],
            },
        ],
    },
    {
        title: "Sales",
        items: [
            {
                title: "Enquiries",
                href: "/enquiries",
                icon: "MessageSquare",
                scope: ["r:enquiries"],
            },
            { title: "Clients", href: "/clients", icon: "Users", scope: ["r:clients"] },
            { title: "Vendors", href: "/vendors", icon: "Store", scope: ["r:vendors"] },
        ],
    },
    {
        title: "Operations",
        items: [
            { title: "Events", href: "/events", icon: "Calendar", scope: ["r:events"] },
            { title: "Schedules", href: "/schedules", icon: "Clock", scope: ["r:schedules"] },
            {
                title: "CheckLists",
                href: "/checklists",
                icon: "CheckSquare",
                scope: ["r:checklists"],
            },
            { title: "Inventory", href: "/inventory", icon: "Package", scope: ["r:inventory"] },
        ],
    },
    {
        title: "Finances",
        items: [
            { title: "Estimates", href: "/estimates", icon: "FileText", scope: ["r:estimates"] },
            { title: "Expenses", href: "/expenses", icon: "Wallet", scope: ["r:expenses"] },
            { title: "Bills", href: "/bills", icon: "Receipt", scope: ["r:bills"] },
            { title: "Reports", href: "/reports", icon: "BarChart", scope: ["r:reports"] },
        ],
    },
    {
        title: "Administrations",
        items: [{ title: "Users", href: "/users", icon: "User", scope: ["r:users"] }],
    },
];
