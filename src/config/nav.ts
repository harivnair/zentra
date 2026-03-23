export interface NavItem {
    title: string;
    href: string;
    icon?: string;
    disabled?: boolean;
    external?: boolean;
    badge?: string;
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
        items: [{ title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
    },
    {
        title: "Sales",
        items: [
            { title: "Enquiries", href: "/enquiries", icon: "MessageSquare" },
            { title: "Clients", href: "/clients", icon: "Users" },
            { title: "Vendors", href: "/vendors", icon: "Store" },
        ],
    },
    {
        title: "Operations",
        items: [
            { title: "Events", href: "/events", icon: "Calendar" },
            { title: "Schedules", href: "/schedules", icon: "Clock" },
            { title: "CheckLists", href: "/checklists", icon: "CheckSquare" },
            { title: "Inventory", href: "/inventory", icon: "Package" },
        ],
    },
    {
        title: "Finances",
        items: [
            { title: "Estimates", href: "/estimates", icon: "FileText" },
            { title: "Expenses", href: "/expenses", icon: "Wallet" },
            { title: "Bills", href: "/bills", icon: "Receipt" },
            { title: "Reports", href: "/reports", icon: "BarChart" },
        ],
    },
    {
        title: "Administrations",
        items: [{ title: "Users", href: "/users", icon: "User" }],
    },
];
