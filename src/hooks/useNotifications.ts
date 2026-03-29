"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationData } from "@/types/notification";
import { apiRequest } from "@/lib/api/api-client";
import { useAuth } from "@/context/auth";
import { formatApiTimestamp } from "@/lib/utils/date";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/utils/storage";
import { NOTIFICATION_INTERVAL_MS } from "@/constants";

const POLL_INTERVAL_MS = NOTIFICATION_INTERVAL_MS;
const STORAGE_KEY = (userId: string) => `notifications_since_${userId}`;

async function fetchNotifications(userId: string, since?: string): Promise<NotificationData[]> {
    const params = new URLSearchParams({ uid: userId });
    if (since) {
        params.set("since", since);
    }

    const res = await apiRequest(`/api/notifications?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
    return res.json();
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [since, setSince] = useState<string | undefined>(undefined);
    const { user } = useAuth();

    // Initialize "since" from localStorage or user's lastLoginTimestamp
    useEffect(() => {
        if (!user?.uid) return;

        const stored = getLocalStorageItem(STORAGE_KEY(user.uid));
        if (stored) {
            setSince(stored);
        } else if (user.lastLoginTimestamp) {
            setSince(formatApiTimestamp(user.lastLoginTimestamp));
        } else {
            // Use a very old date to fetch all notifications on first load
            setSince("2000-01-01T00:00:00");
        }
    }, [user?.uid, user?.lastLoginTimestamp]);

    const fetch = useCallback(async () => {
        if (!user?.uid || !since) return;

        try {
            const data = await fetchNotifications(user.uid, since);

            if (data.length > 0) {
                // Get the latest timestamp from the response
                const latest = data.reduce(
                    (max, n) => (n.createdAt > max ? n.createdAt : max),
                    data[0].createdAt,
                );
                const formattedLatest = formatApiTimestamp(latest);
                // Update since cursor
                setSince(formattedLatest);
                setLocalStorageItem(STORAGE_KEY(user.uid), formattedLatest);

                // Deduplicate and add new notifications
                setNotifications(prev => {
                    const existingTimestamps = new Set(prev.map(n => n.createdAt));
                    const newNotifications = data.filter(n => !existingTimestamps.has(n.createdAt));
                    if (newNotifications.length === 0) return prev;
                    return [...newNotifications.reverse(), ...prev];
                });
            }

            setError(null);
        } catch (err) {
            console.error("[useNotifications] Error:", err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, since]);

    useEffect(() => {
        if (!user?.uid || !since) return;

        fetch();

        const interval = setInterval(fetch, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetch, user?.uid, since]);

    const markAllRead = useCallback(() => {
        setNotifications([]);
    }, []);

    const markOneRead = useCallback((index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index));
    }, []);

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        markAllRead,
        markOneRead,
        loading,
        error,
    };
}
