export type DashboardIconName = "event" | "calendar" | "receipt" | "message" | "wallet" | "chart";

export interface DashboardStat {
    label: string;
    value: string;
    trend?: string;
    icon: DashboardIconName;
    iconColor: string;
    iconBg: string;
}
