"use client"

import React, { useEffect, useState } from "react"
// ...existing imports...
import DropdownMenu from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import CreateEventModal from "@/components/create-event-modal"
import { EventFormData } from "@/types/event"
import { showConfirmation } from "@/components/confirmation-toast"
import { toast } from "sonner"
import { TableRowSkeleton, ListSkeleton } from "@/components/skeleton-loader"
import { apiRequest } from "@/lib/api-client"
import { useAuth } from "@/context/auth"
import { Calendar } from "lucide-react"
import { useEventPrefill } from "@/context/event-prefill"

type EventItem = {
    id: number | string
    eventID?: string
    title: string
    client?: {
        id?: string
        name?: string
        email?: string
        phone?: string
        address?: string
    } | string
    startDate?: string
    endDate?: string
    eventStartDate?: string  // Backend field name
    eventEndDate?: string    // Backend field name
    location?: string
    venue?: string
    status?: string
    estimateId?: string
    enquiryId?: string
}

const StatusPill = ({ status }: { status?: string }) => {
    const s = String(status ?? '').toLowerCase()
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (s === 'in progress' || s === 'in_progress' || s === 'ongoing') return <span className={base + " bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"}>{status}</span>
    if (s === 'cancelled' || s === 'canceled') return <span className={base + " bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"}>{status ?? 'Not Started'}</span>
}

// Helper function to format dates using native JavaScript Date
const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateStr)
            return 'N/A'
        }
        // Format: Oct 28, 2025 6:30 AM
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    } catch (error) {
        console.error('Error formatting date:', dateStr, error)
        return 'N/A'
    }
}

const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return 'N/A'
    if (!endDate) return formatDateTime(startDate)
    if (!startDate) return 'N/A'

    try {
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Invalid date range:', { startDate, endDate })
            return 'N/A'
        }

        // Check if same day
        const sameDay = start.toDateString() === end.toDateString()

        if (sameDay) {
            // Format: Oct 28, 2025 · 6:30 AM - 7:15 AM
            const dateStr = start.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
            const startTime = start.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            const endTime = end.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            return `${dateStr} · ${startTime} - ${endTime}`
        }

        // Different days: Oct 28, 6:30 AM - Oct 29, 5:00 PM
        const startStr = start.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        const endStr = end.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        return `${startStr} - ${endStr}`
    } catch (error) {
        console.error('Error formatting date range:', { startDate, endDate }, error)
        return 'N/A'
    }
}

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null)
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
    const { user } = useAuth()
    const { prefill: contextPrefill, clearPrefill } = useEventPrefill()

    // Handle prefill from context (coming from estimates page)
    useEffect(() => {
        if (contextPrefill) {
            setEditingEvent(null)
            setIsModalOpen(true)
            clearPrefill()
        }
    }, [contextPrefill, clearPrefill])

    useEffect(() => {
        let mounted = true
        const fetchEvents = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await apiRequest('/api/events')
                if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
                const data = await res.json()

                // Normalize the response to map backend field names to frontend field names
                const normalizedData = Array.isArray(data) ? data.map((ev: EventItem) => ({
                    ...ev,
                    startDate: ev.eventStartDate || ev.startDate,
                    endDate: ev.eventEndDate || ev.endDate,
                })) : []

                console.log('Normalized events data:', normalizedData)
                if (mounted) setEvents(normalizedData)
            } catch (err: unknown) {
                if (mounted) setError((err as Error)?.message ?? 'Unknown error')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchEvents()
        return () => { mounted = false }
    }, [])

    const handleDelete = async (id: string | number) => {
        const idString = String(id)

        showConfirmation({
            title: "Delete Event",
            description: "Are you sure you want to delete this event? This action cannot be undone.",
            onConfirm: async () => {
                // Add to deleting state immediately
                setDeletingIds(prev => new Set(prev).add(idString))

                try {
                    console.log('Deleting event with ID:', idString)
                    const res = await apiRequest(`/api/events/${idString}`, { method: 'DELETE' })
                    if (!res.ok) {
                        const txt = await res.text().catch(() => '')
                        console.log('Delete response status:', res.status, 'body:', txt)
                        throw new Error(`Delete failed: ${res.status} ${txt}`)
                    }
                    // Remove from UI
                    setEvents(prev => prev.filter(e => String(e.id) !== idString))
                    toast.success('Event deleted successfully')
                } catch (err) {
                    console.error('Failed to delete event', err)
                    toast.error('Failed to delete event')
                } finally {
                    // Remove from deleting state
                    setDeletingIds(prev => {
                        const next = new Set(prev)
                        next.delete(idString)
                        return next
                    })
                }
            },
        })
    }

    const handleEdit = async (id: string | number) => {
        // Fetch full event details to get estimateId
        try {
            const res = await apiRequest(`/api/events/${encodeURIComponent(String(id))}`)
            if (!res.ok) {
                toast.error('Failed to load event details')
                return
            }
            const ev = await res.json()

            setEditingEvent({
                id: String(ev.id ?? id),
                title: ev.title || ev.eventName || '',
                eventStartDate: ev.eventStartDate ?? ev.startDate ?? '',
                eventEndDate: ev.eventEndDate ?? ev.endDate ?? '',
                location: ev.location ?? '',
                venue: ev.venue ?? '',
                clientId: typeof ev.client === 'string' ? '' : ev.client?.id ?? '',
                estimateId: ev.estimateId ?? '',
                enquiryId: ev.enquiryId ?? '',
            })
            setIsModalOpen(true)
        } catch (error) {
            console.error('Failed to fetch event for edit:', error)
            toast.error('Failed to load event details')
        }
    }

    const getDropdownItems = (ev: EventItem) => {
        const isDeleting = deletingIds.has(String(ev.id))
        return [
            { label: 'View', icon: '🔍', action: () => window.location.href = `/events/${ev.eventID || ev.id}`, disabled: isDeleting },
            { label: 'Edit', icon: '✏️', action: () => handleEdit(ev.id), disabled: isDeleting },
            {
                label: isDeleting ? 'Deleting...' : 'Delete',
                icon: '🗑️',
                action: () => handleDelete(ev.id),
                variant: 'danger' as const,
                disabled: isDeleting
            }
        ]
    }

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Events</h2>
                        <p className="text-muted-foreground">All scheduled events and their status</p>
                    </div>
                </div>
            </div>

            <div className="glass rounded-2xl p-4 sm:p-6">
                <div className="hidden md:block">
                    {error && <div className="p-4 text-red-600">{error}</div>}

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="py-3">Event Name</th>
                                <th className="py-3">Client</th>
                                <th className="py-3">Start Date</th>
                                <th className="py-3">End Date</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-right">&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody className="stagger-rows">
                            {loading && <TableRowSkeleton rows={8} />}
                            {!loading && !error && events.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No events found.</td>
                                </tr>
                            )}
                            {events.map((ev) => {
                                const isDeleting = deletingIds.has(String(ev.id))
                                return (
                                    <tr key={ev.id} className={`border-t hover:bg-gray-50 cursor-pointer ${isDeleting ? 'opacity-50 pointer-events-none bg-gray-50' : ''}`} onClick={() => !isDeleting && (window.location.href = `/events/${ev.eventID || ev.id}`)}>
                                        <td className="py-4">
                                            {isDeleting && (
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {ev.title}
                                                </span>
                                            )}
                                            {!isDeleting && ev.title}
                                        </td>
                                        <td className="py-4">
                                            <div className="font-medium">{typeof ev.client === 'string' ? ev.client : ev.client?.name}</div>
                                            <div className="text-muted-foreground text-xs">{typeof ev.client === 'string' ? '' : `${ev.client?.email ?? ''}${ev.client?.phone ? ' · ' + ev.client?.phone : ''}`}</div>
                                        </td>
                                        <td className="py-4">{formatDateTime(ev.startDate)}</td>
                                        <td className="py-4">{formatDateTime(ev.endDate)}</td>
                                        <td className="py-4"><StatusPill status={ev.status} /></td>
                                        <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}><DropdownMenu items={getDropdownItems(ev)} /></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile stacked cards */}
                <div className="flex flex-col gap-4 md:hidden stagger-children">
                    {loading && <ListSkeleton type="cards" items={5} />}
                    {error && <div className="p-4 text-red-600">{error}</div>}
                    {!loading && !error && events.length === 0 && (
                        <div className="p-4 text-muted-foreground">No events found.</div>
                    )}

                    {events.map((ev) => {
                        const isDeleting = deletingIds.has(String(ev.id))
                        return (
                            <div key={ev.id} className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isDeleting ? 'opacity-50 pointer-events-none bg-gray-50' : ''}`} onClick={() => !isDeleting && (window.location.href = `/events/${ev.eventID || ev.id}`)}>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                        {isDeleting && (
                                            <span className="inline-flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {ev.title}
                                            </span>
                                        )}
                                        {!isDeleting && ev.title}
                                    </div>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <StatusPill status={ev.status} />
                                        <DropdownMenu items={getDropdownItems(ev)} />
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {formatDateRange(ev.startDate, ev.endDate)}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {typeof ev.client === 'string' ? ev.client : ev.client?.name}
                                </div>
                                {typeof ev.client !== 'string' && ev.client && (
                                    <div className="mt-3 text-sm text-muted-foreground">
                                        {ev.client.email && <div>Email: <span className="font-medium">{ev.client.email}</span></div>}
                                        {ev.client.phone && <div>Phone: <span className="font-medium">{ev.client.phone}</span></div>}
                                        {ev.client.address && <div className="truncate">{ev.client.address}</div>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingEvent(null)
                }}
                onSubmit={async () => {
                    setLoading(true)
                    try {
                        const res = await apiRequest('/api/events')
                        const data = await res.json()
                        setEvents(Array.isArray(data) ? data : [])
                        toast.success('Event updated successfully')
                    } catch (err) {
                        console.error('Failed to refresh events', err)
                    } finally {
                        setLoading(false)
                    }
                }}
                editData={editingEvent}
                prefillData={contextPrefill ?? null}
                mode="edit"
            />
        </div>
    )
}
