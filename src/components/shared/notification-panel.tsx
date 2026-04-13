"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { BellIcon, CheckIcon } from "@/components/ui/icons";
import { formatDisplayTime } from "@/lib/utils/date";
import { useNotifications } from "@/hooks/useNotifications";

type Tab = "all" | "unread";

function getNotificationAvatarColor(type: string): string {
    const colorMap: Record<string, string> = {
        ENQUIRY: "bg-blue-100 text-blue-700",
        EVENT: "bg-purple-100 text-purple-700",
        USER: "bg-green-100 text-green-700",
        SYSTEM: "bg-gray-100 text-gray-700",
        INVENTORY: "bg-orange-100 text-orange-700",
        ESTIMATE: "bg-indigo-100 text-indigo-700",
        VENDOR: "bg-pink-100 text-pink-700",
        CHECKLIST: "bg-teal-100 text-teal-700",
    };
    return colorMap[type] ?? "bg-gray-100 text-gray-700";
}

function getNotificationInitials(type: string): string {
    return type.slice(0, 2).toUpperCase();
}

export function NotificationPanel() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("all");
    const { notifications, loading, markAllRead } = useNotifications();
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filtered = tab === "unread" ? notifications.filter(n => !n.isRead) : notifications;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell trigger */}
            <button
                onClick={() => setOpen(v => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <BellIcon size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-border bg-surface shadow-xl sm:w-[400px]">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3">
                        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                    </div>

                    {/* Tabs */}
                    <div className="mx-5 flex rounded-lg border border-border">
                        <button
                            onClick={() => setTab("all")}
                            className={cn(
                                "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                                tab === "all"
                                    ? "bg-primary-light text-primary"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setTab("unread")}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                                tab === "unread"
                                    ? "bg-primary-light text-primary"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Notification list */}
                    <div className="mt-3 max-h-[360px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : filtered.length > 0 ? (
                            filtered.map(n => (
                                <div
                                    key={`${n.type}-${n.createdAt}`}
                                    className={cn(
                                        "flex items-start gap-3 px-5 py-3 transition-colors",
                                        !n.isRead && "bg-primary-light/50",
                                    )}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={cn(
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                            getNotificationAvatarColor(n.type),
                                        )}
                                    >
                                        {getNotificationInitials(n.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground">{n.message}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatDisplayTime(n.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!n.isRead && (
                                        <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                        <button
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 cursor-pointer"
                        >
                            <CheckIcon size={14} />
                            Mark all as read
                        </button>
                        {/* TODO: Implement notification view all functionality */}
                        {/* <Link href="/notifications" onClick={() => setOpen(false)}>
                            <Button size="sm">View All Notifications</Button>
                        </Link> */}
                    </div>
                </div>
            )}
        </div>
    );
}
