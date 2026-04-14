import { CalendarEvent } from "@/types/event";

export type IconName = "event" | "calendar" | "receipt" | "message" | "wallet" | "chart";

export interface DashboardStat {
    label: string;
    value: string;
    trend?: string;
    icon: IconName;
    iconColor: string;
    iconBg: string;
}

export const DASHBOARD_STATS: DashboardStat[] = [
    {
        label: "Upcoming Events",
        value: "24",
        trend: "+12%",
        icon: "event",
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
    },
    {
        label: "Total Events",
        value: "156",
        trend: "+8%",
        icon: "calendar",
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50",
    },
    {
        label: "Pending Estimates",
        value: "12",
        trend: "-3%",
        icon: "receipt",
        iconColor: "text-orange-600",
        iconBg: "bg-orange-50",
    },
    {
        label: "Open Enquiries",
        value: "8",
        trend: "+5%",
        icon: "message",
        iconColor: "text-teal-600",
        iconBg: "bg-teal-50",
    },
    {
        label: "Client Bills",
        value: "42",
        trend: "+18%",
        icon: "wallet",
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
    },
    {
        label: "Active this week",
        value: "6",
        trend: "+2%",
        icon: "chart",
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-50",
    },
];
