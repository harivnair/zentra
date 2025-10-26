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

type EventItem = {
    id: number | string
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
    status?: string
}

const StatusPill = ({ status }: { status?: string }) => {
    const s = String(status ?? '').toLowerCase()
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (s === 'in progress' || s === 'in_progress' || s === 'ongoing') return <span className={base + " bg-yellow-100 text-yellow-800"}>{status}</span>
    if (s === 'cancelled' || s === 'canceled') return <span className={base + " bg-red-100 text-red-800"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700"}>{status ?? 'Not Started'}</span>
}

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [editingEvent, setEditingEvent] = useState<EventFormData | null>(null)

    useEffect(() => {
        let mounted = true
        const fetchEvents = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await apiRequest('/api/events')
                if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
                const data = await res.json()
                if (mounted) setEvents(Array.isArray(data) ? data : [])
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
        showConfirmation({
            title: "Delete Event",
            description: "Are you sure you want to delete this event? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const idString = String(id)
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
                }
            },
        })
    }

    const handleEdit = (id: string | number) => {
        // Open edit modal directly — no confirmation
        const ev = events.find(e => String(e.id) === String(id))
        if (ev) {
            setEditingEvent({ id: String(ev.id), title: ev.title, date: ev.startDate ?? ev.endDate ?? '', location: typeof ev.client !== 'string' ? ev.client?.name : '', clientId: typeof ev.client === 'string' ? '' : ev.client?.id })
            setModalMode('edit')
            setIsModalOpen(true)
        }
    }

    const getDropdownItems = (ev: EventItem) => [
        { label: 'View', icon: '🔍', action: () => window.location.href = `/events/${ev.id}` },
        { label: 'Edit', icon: '✏️', action: () => handleEdit(ev.id) },
        { label: 'Delete', icon: '🗑️', action: () => handleDelete(ev.id), variant: 'danger' as const }
    ]

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-md bg-blue-100 flex items-center justify-center">🎫</div>
                    <div>
                        <h2 className="text-2xl font-bold">Events</h2>
                        <p className="text-muted-foreground">All scheduled events and their status</p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto">
                    <Button className="w-full sm:w-auto" onClick={() => { setModalMode('create'); setEditingEvent(null); setIsModalOpen(true) }}>+ Create Event</Button>
                </div>
            </div>

            <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
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
                        <tbody>
                            {loading && <TableRowSkeleton rows={8} />}
                            {!loading && !error && events.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No events found.</td>
                                </tr>
                            )}
                            {events.map((ev) => (
                                <tr key={ev.id} className="border-t hover:bg-gray-50">
                                    <td className="py-4">{ev.title}</td>
                                    <td className="py-4">
                                        <div className="font-medium">{typeof ev.client === 'string' ? ev.client : ev.client?.name}</div>
                                        <div className="text-muted-foreground text-xs">{typeof ev.client === 'string' ? '' : `${ev.client?.email ?? ''}${ev.client?.phone ? ' · ' + ev.client?.phone : ''}`}</div>
                                    </td>
                                    <td className="py-4">{ev.startDate}</td>
                                    <td className="py-4">{ev.endDate}</td>
                                    <td className="py-4"><StatusPill status={ev.status} /></td>
                                    <td className="py-4 text-right"><DropdownMenu items={getDropdownItems(ev)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile stacked cards */}
                <div className="flex flex-col gap-4 md:hidden">
                    {loading && <ListSkeleton type="cards" items={5} />}
                    {error && <div className="p-4 text-red-600">{error}</div>}
                    {!loading && !error && events.length === 0 && (
                        <div className="p-4 text-muted-foreground">No events found.</div>
                    )}

                    {events.map((ev) => (
                        <div key={ev.id} className="border rounded-md p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{ev.title}</div>
                                <div className="flex items-center gap-2">
                                    <StatusPill status={ev.status} />
                                    <DropdownMenu items={getDropdownItems(ev)} />
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">{ev.startDate} · {typeof ev.client === 'string' ? ev.client : ev.client?.name}</div>
                            {typeof ev.client !== 'string' && ev.client && (
                                <div className="mt-3 text-sm text-muted-foreground">
                                    {ev.client.email && <div>Email: <span className="font-medium">{ev.client.email}</span></div>}
                                    {ev.client.phone && <div>Phone: <span className="font-medium">{ev.client.phone}</span></div>}
                                    {ev.client.address && <div className="truncate">{ev.client.address}</div>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingEvent(null); setModalMode('create') }}
                onSubmit={async () => {
                    // Refresh events list after create/update
                    setLoading(true)
                    try {
                        const res = await apiRequest('/api/events')
                        const data = await res.json()
                        setEvents(Array.isArray(data) ? data : [])
                    } catch (err) {
                        console.error('Failed to refresh events', err)
                    } finally {
                        setLoading(false)
                    }
                }}
                editData={editingEvent}
                mode={modalMode}
            />
        </div>
    )
}
