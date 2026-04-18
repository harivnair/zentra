"use client";
import {
    Card,
    CardContent,
    CardHeader,
    Badge,
    LinkText,
    DataTable,
    type Column,
    PageHeader,
} from "@/components/ui";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DASHBOARD_STATS, dashboardIcons, SAMPLE_EVENTS } from "@/constants/dashboard";
import { formatDate } from "@/lib/utils/date";
import { CalendarIcon } from "@/components/ui/icons";
import { CalendarEvent } from "@/types/event";
import { EventCalender } from "@/components/dashboard/event-calender";
import { useAuth } from "@/context/auth";
import { DashboardIconName } from "@/types/dashboard";

const STATUS_VARIANT = {
    open: "info",
    completed: "success",
    cancelled: "danger",
    closed: "default",
} as const;

const eventColumns: Column<CalendarEvent>[] = [
    {
        key: "event",
        header: "Event",
        render: row => (
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <CalendarIcon size={18} />
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold">{row.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.client}</p>
                </div>
            </div>
        ),
        className: "max-w-[220px]",
    },
    {
        key: "date",
        header: "Date",
        render: row => formatDate(row.date),
    },
    {
        key: "task",
        header: "Task",
        render: row => row.currentTask ?? "—",
        className: "text-muted-foreground",
    },
    {
        key: "status",
        header: "Status",
        render: row =>
            row.status ? (
                <Badge variant={STATUS_VARIANT[row.status]}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </Badge>
            ) : null,
    },
    {
        key: "assignee",
        header: "Assignee",
        render: row => row.asignee ?? "—",
        className: "text-muted-foreground",
    },
];

function getIcon(iconName: DashboardIconName, size = 24, className?: string) {
    const IconComponent = dashboardIcons[iconName] || CalendarIcon;
    return <IconComponent size={size} className={className} />;
}

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <PageHeader
                title={`${greeting}, ${user?.name || "there"}!`}
                description="Here's what's happening with your events today."
            />

            {/* Top row: UpcomingEvents (left) + Stat tiles (right) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 xl:col-span-4">
                    <EventCalender />
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-7 xl:col-span-8">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {DASHBOARD_STATS.map(stat => (
                            <Card
                                key={stat.label}
                                className="rounded-2xl border-slate-100 bg-surface shadow-sm transition-shadow hover:shadow-md"
                            >
                                <CardContent className="sm:pt-3 sm:pb-2">
                                    <div className="mb-2 flex items-center gap-3">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                                        >
                                            {getIcon(stat.icon, 22)}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>

                                    <p className="mt-1 text-2xl font-bold text-slate-900 pl-3">
                                        {stat.value}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <QuickActions />
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground sm:text-lg">
                        Recent Events
                    </h2>
                    <LinkText href="/events">View all</LinkText>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={eventColumns}
                        data={SAMPLE_EVENTS}
                        rowKey={row => row.id}
                        emptyMessage="No events yet. Create your first event to get started."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
