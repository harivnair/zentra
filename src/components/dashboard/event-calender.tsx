"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { SAMPLE_EVENTS } from "@/constants/dashboard";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@/components/ui/icons";
import { CalendarEvent } from "@/types/event";
import { DAY_LABELS, MONTH_NAMES } from "@/constants";
import { getDaysInMonth, getFirstDayOfMonth, toDateKey } from "@/lib/utils/date";

export function EventCalender() {
    const today = useMemo(() => new Date(), []);
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>(todayKey);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const ev of SAMPLE_EVENTS) {
            const existing = map.get(ev.date) || [];
            existing.push(ev);
            map.set(ev.date, existing);
        }
        return map;
    }, []);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const totalCells = 42;
    const trailingBlanks = totalCells - firstDay - daysInMonth;
    const selectedEvents = eventsByDate.get(selectedDate) || [];

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    }

    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    }

    return (
        <div className="rounded-lg border border-border bg-surface shadow-sm sm:rounded-xl">
            {/* Header: title + count */}
            <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming Events
                </h3>
            </div>

            {/* Calendar section */}
            <div className="px-4 pt-3 sm:px-5 sm:pt-4">
                {/* Month navigation */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={prevMonth}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Previous month"
                        >
                            <ChevronLeftIcon size={14} />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Next month"
                        >
                            <ChevronRightIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-y-1 text-center">
                    {DAY_LABELS.map((d, i) => (
                        <div key={i} className="pb-1 text-[11px] font-medium text-muted-foreground">
                            {d}
                        </div>
                    ))}

                    {/* Leading blanks */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`blank-${i}`} className="h-8" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = toDateKey(viewYear, viewMonth, day);
                        const hasEvent = eventsByDate.has(dateKey);
                        const isToday = dateKey === todayKey;
                        const isSelected = dateKey === selectedDate;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(dateKey)}
                                className={cn(
                                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : isToday
                                        ? "border border-primary text-primary"
                                        : hasEvent
                                        ? "bg-primary-light text-primary font-semibold"
                                        : "text-foreground hover:bg-muted"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}

                    {/* Trailing blanks to fill 6 rows */}
                    {Array.from({ length: trailingBlanks }).map((_, i) => (
                        <div key={`trail-${i}`} className="h-8" />
                    ))}
                </div>
            </div>

            {/* Selected date event details */}
            <div className="mt-2 border-t border-border px-4 py-3 sm:px-5 sm:py-4">
                {selectedEvents.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                        {selectedEvents.map(ev => (
                            <div key={ev.id} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <CalendarIcon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {ev.title}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {ev.client}
                                        {ev.location && ` · ${ev.location}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-xs text-muted-foreground">
                        No events on this date
                    </p>
                )}
            </div>
        </div>
    );
}
