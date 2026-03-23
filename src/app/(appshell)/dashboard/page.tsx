import type { Metadata } from "next";
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
import { DASHBOARD_STATS, SAMPLE_EVENTS } from "@/constants/dashboard";
import { formatDate } from "@/lib/utils/date";
import { CalendarIcon } from "@/components/ui/icons";
import { CalendarEvent } from "@/types/event";
import { EventCalender } from "@/components/dashboard/event-calender";

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

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <PageHeader title="Dashboard" description="Overview of your events and activity" />

            {/* Top row: UpcomingEvents (left) + Stat tiles (right) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5 xl:col-span-4">
                    <EventCalender />
                </div>

                <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-7 xl:col-span-8">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {DASHBOARD_STATS.map(stat => (
                            <Card key={stat.label}>
                                <CardContent>
                                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
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
