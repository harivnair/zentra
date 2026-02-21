"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import DropdownMenu from "@/components/ui/dropdown-menu"
import CreateEnquiryModal from "@/components/create-enquiry-modal"
import { EnquiryFormData } from "@/types/enquiry"

import { useEnquiries } from "@/context/enquiries"
import { useClients } from "@/hooks/useClients"
import { ListSkeleton, TableRowSkeleton } from "@/components/skeleton-loader"
import { showConfirmation } from "@/components/confirmation-toast"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/endpoint"
import { useAuth } from "@/context/auth"
import { FileText } from "lucide-react"

type Enquiry = {
    id: number | string
    eventID?: string
    client: string
    date: string
    poc: string
    status: string
    assignee: string
    highlvelRequirement?: string
    enquiryDate?: string
    fromDate?: string
    toDate?: string
    venue?: string
    enquiryPoCNumber?: string
    clientType?: 'corporate' | 'individual'
    eventType?: 'CORPORATE' | 'INDIVIDUAL'
    eventPoC?: string
    eventName?: string
    enquiryPoC?: string
    eventPoCNumber?: string
    assignedTo?: string
    location?: string
    [k: string]: unknown
}

const StatusPill = ({ status }: { status: string }) => {
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (status === "In Progress") return <span className={base + " bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"}>{status}</span>
}

const MemoStatusPill = React.memo(StatusPill)

export default function EnquiriesPage() {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEnquiry, setEditingEnquiry] = useState<EnquiryFormData | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    const { enquiries: rawEnquiries, loading, error, refresh } = useEnquiries()
    const enquiries = rawEnquiries as unknown as Enquiry[]
    const { clients, refresh: refreshClients, loading: clientsLoading } = useClients()
    const { user } = useAuth()
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
    const [eventSaving, setEventSaving] = useState(false)

    // Create a map of client ID to client name
    const clientMap = useMemo(() => {
        const map = new Map<string, string>()
        clients.forEach(client => map.set(client.id, client.name))
        return map
    }, [clients])

    // Count all enquiries (no tab filtering needed)
    const enquiriesCount = useMemo(() => enquiries.length, [enquiries])

    const handleCreateEnquiry = async () => {
        try {
            await Promise.all([refresh(), refreshClients()])
        } catch (error) {
            console.error("Error refreshing enquiries:", error)
        }
    }

    const openCreateModal = () => {
        setModalMode('create')
        setEditingEnquiry(null)
        setIsModalOpen(true)
    }

    const openEditModal = (enquiry: Enquiry) => {
        setModalMode('edit')

        // Convert Enquiry to EnquiryFormData format
        const editData: EnquiryFormData = {
            id: enquiry.id,
            highlvelRequirement: enquiry.highlvelRequirement || '',
            enquiryDate: enquiry.enquiryDate || enquiry.date || '',
            fromDate: enquiry.fromDate || '',
            toDate: enquiry.toDate || '',
            venue: enquiry.venue || '',
            location: (enquiry as { location?: string }).location || '',
            clientPoC: enquiry.poc || '',
            enquiryPoCNumber: enquiry.enquiryPoCNumber || '',
            client: enquiry.client,
            eventType: (enquiry.eventType as 'PERSONAL' | 'CORPORATE' | 'OTHER' | undefined) || 'CORPORATE',
            eventPoC: enquiry.eventPoC || '',
            title: enquiry.eventName || '',
            enquiryPoC: enquiry.enquiryPoC || '',
            eventPoCNumber: enquiry.eventPoCNumber || '',
            assignedTo: enquiry.assignedTo || ''
        }

        setEditingEnquiry(editData)
        setIsModalOpen(true)
    }

    const getDropdownItems = (enquiry: { id: string | number }) => [
        {
            label: "Edit",
            icon: "✏️",
            action: () => handleEdit(String(enquiry.id))
        },
        {
            label: "Delete",
            icon: "🗑️",
            action: () => handleDelete(String(enquiry.id)),
            variant: "danger" as const
        },
        {
            label: "Print",
            icon: "🖨️",
            action: () => handlePrint(String(enquiry.id))
        },
        {
            label: "Download",
            icon: "⬇️",
            action: () => handleDownload(String(enquiry.id))
        }
    ]

    const handleEdit = (id: string) => {
        console.log("Edit enquiry:", id)
        const enquiry = enquiries.find(e => String(e.id) === id)
        if (enquiry) {
            openEditModal(enquiry)
        }
    }

    const handleDelete = async (id: string) => {
        showConfirmation({
            title: "Delete Enquiry",
            description: "Are you sure you want to delete this enquiry? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    console.log("Delete enquiry:", id)
                    const res = await apiRequest(`/api/enquiries/${id}`, {
                        method: 'DELETE'
                    })

                    // Treat 200..299 and 204 as success. Some backends return empty body for DELETE.
                    if (res.ok) {
                        try {
                            // attempt to read body for debugging, but ignore parse errors
                            const text = await res.text().catch(() => '')
                            console.log('Delete response body:', text)
                        } catch {
                            // ignore
                        }

                        // Refresh enquiries list from context, but don't treat a refresh failure
                        // as a delete failure (backend may have deleted the resource while
                        // the list refresh fails due to a transient issue).
                        try {
                            await refresh()
                        } catch (refreshErr) {
                            console.error('Failed to refresh enquiries after delete:', refreshErr)
                        }

                        toast.success('Enquiry deleted successfully')
                    } else {
                        // Try to surface backend message if any
                        const errText = await res.text().catch(() => '')
                        console.error('Delete failed, status:', res.status, 'body:', errText)
                        throw new Error(`Failed to delete enquiry: ${res.status} ${errText}`)
                    }
                } catch (error) {
                    toast.error('Failed to delete enquiry')
                    console.error("Error deleting enquiry:", error)
                }
            },
        })
    }

    const handlePrint = (id: string) => {
        console.log("Print enquiry:", id)
        // Create a print-friendly version of the enquiry
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            const enquiry = enquiries.find(e => String(e.id) === id)
            if (enquiry) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Enquiry Details - ${enquiry.client}</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                                .field { margin-bottom: 10px; }
                                .label { font-weight: bold; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Enquiry Details</h1>
                            </div>
                            <div class="field"><span class="label">Client:</span> ${enquiry.client}</div>
                            <div class="field"><span class="label">Date:</span> ${enquiry.date}</div>
                            <div class="field"><span class="label">POC:</span> ${enquiry.poc}</div>
                            <div class="field"><span class="label">Status:</span> ${enquiry.status}</div>
                            <div class="field"><span class="label">Assignee:</span> ${enquiry.assignee}</div>
                        </body>
                    </html>
                `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }

    const handleDownload = (id: string) => {
        console.log("Download enquiry:", id)
        const enquiry = enquiries.find(e => String(e.id) === id)
        if (enquiry) {
            // Create a simple CSV download
            const csvContent = `Client,Date,POC,Status,Assignee\n${clientMap.get(enquiry.client) || enquiry.client},${enquiry.date},${enquiry.poc},${enquiry.status},${enquiry.assignee}`
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `enquiry-${id}-${(clientMap.get(enquiry.client) || enquiry.client).replace(/[^a-zA-Z0-9]/g, '_')}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }
    }

    const openViewModal = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry)
        setViewModalOpen(true)
    }

    const closeViewModal = () => {
        setViewModalOpen(false)
        setSelectedEnquiry(null)
    }

    const handleCreateEvent = async () => {
        if (!selectedEnquiry) return
        setEventSaving(true)
        try {
            const payload = {
                title: selectedEnquiry.eventName || selectedEnquiry.title || 'Event',
                eventName: selectedEnquiry.eventName || selectedEnquiry.title || 'Event',
                enquiryDate: selectedEnquiry.date || new Date().toISOString(),
                eventStartDate: selectedEnquiry.fromDate || selectedEnquiry.date || new Date().toISOString(),
                eventEndDate: selectedEnquiry.toDate || selectedEnquiry.date || new Date().toISOString(),
                eventID: selectedEnquiry.eventID,
                location: selectedEnquiry.location || '',
                venue: selectedEnquiry.venue || '',
                status: 'ENQUIRY_CREATED',
                enquiryId: String(selectedEnquiry.id ?? ''),
                client: {
                    id: selectedEnquiry.client ? String(selectedEnquiry.client) : undefined,
                    name: clientMap.get(selectedEnquiry.client) || undefined,
                },
                vendor: undefined,
                items: [],
                categorySummary: [],
                vendorSummary: [],
                gst: 0,
                tds: 0,
                advanceAmt: 0,
            }

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errText = await res.text().catch(() => '')
                throw new Error(`Failed to create event: ${res.status} ${errText}`)
            }

            const createdEvent = await res.json()

            toast.success('Event created from enquiry')
            closeViewModal()

            if (createdEvent && (createdEvent.eventID || createdEvent.id)) {
                router.push(`/events/${createdEvent.eventID || createdEvent.id}`)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create event'
            toast.error(message)
            console.error(message)
        } finally {
            setEventSaving(false)
        }
    }

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            Hi, {user?.name || user?.uid || 'User'}!
                        </h2>
                        <p className="text-muted-foreground">
                            You have {enquiriesCount} {enquiriesCount === 1 ? 'Enquiry' : 'Enquiries'}
                        </p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto">
                    <Button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto"
                    >
                        + Create New Enquiry
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                {/* (debug output removed) */}

                <div className="mt-6 glass rounded-2xl p-4 sm:p-6">
                    {/* Mobile / small screens: stacked cards */}
                    <div className="flex flex-col gap-4 md:hidden stagger-children">
                        {(loading || clientsLoading) && <ListSkeleton type="cards" items={5} />}
                        {error && <div className="p-4 text-red-600">{error}</div>}
                        {!loading && !clientsLoading && !error && enquiries.length === 0 && (
                            <div className="p-4 text-muted-foreground">No enquiries found.</div>
                        )}

                        {!loading && !clientsLoading && !error && enquiries.map((e) => (
                            <div key={e.id} className="border rounded-md p-4 cursor-pointer" onClick={() => openViewModal(e)}>
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{clientMap.get(e.client) || e.client}</div>
                                    <div className="flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                                        <StatusPill status={e.status} />
                                        <DropdownMenu items={getDropdownItems(e)} />
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">{e.date} · {e.poc}</div>
                                <div className="mt-3 text-sm">Assignee: <span className="font-medium">{e.assignee}</span></div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: table view */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground border-b">
                                    <th className="py-3 px-4">Event Details</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Schedule</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Team</th>
                                    <th className="py-3 px-4 max-w-xs">Requirements</th>
                                    <th className="py-3 px-4 text-right">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody className="stagger-rows">
                                {(loading || clientsLoading) && <TableRowSkeleton rows={8} />}
                                {error && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !clientsLoading && !error && enquiries.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                            No enquiries found.
                                        </td>
                                    </tr>
                                )}
                                {!loading && !clientsLoading && !error && enquiries.map((e) => (
                                    <tr key={e.id} className="border-b hover:bg-gray-50 align-top cursor-pointer" onClick={() => openViewModal(e)}>
                                        {/* Event Details */}
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-gray-900">{e.eventName || '-'}</div>
                                            <div className="text-xs text-gray-500 mt-1">ID: {e.eventID || e.id}</div>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {e.eventType || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Client */}
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-gray-900">{clientMap.get(e.client) || e.client}</div>
                                            {(e.poc || e.enquiryPoCNumber) && (
                                                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                    {e.poc && <div>POC: {e.poc}</div>}
                                                    {e.enquiryPoCNumber && <div>Ph: {e.enquiryPoCNumber}</div>}
                                                </div>
                                            )}
                                        </td>

                                        {/* Schedule */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-xs text-gray-500">Created</div>
                                                    <div className="text-sm">{e.date ? new Date(e.date).toLocaleDateString() : '-'}</div>
                                                </div>
                                                {(e.fromDate || e.toDate) && (
                                                    <div>
                                                        <div className="text-xs text-gray-500">Event</div>
                                                        <div className="text-xs">
                                                            {e.fromDate ? new Date(e.fromDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD'}
                                                            <br />to<br />
                                                            {e.toDate ? new Date(e.toDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-medium">{e.venue || '-'}</div>
                                            {e.location && <div className="text-xs text-gray-500 mt-1">{e.location}</div>}
                                        </td>

                                        {/* Team */}
                                        <td className="py-4 px-4">
                                            <div className="space-y-1 text-xs">
                                                <div><span className="text-gray-500">Assigned:</span> {e.assignee || '-'}</div>
                                                {e.enquiryPoC && <div><span className="text-gray-500">Enq POC:</span> {e.enquiryPoC}</div>}
                                                {e.eventPoC && (
                                                    <div>
                                                        <span className="text-gray-500">Evt POC:</span> {e.eventPoC}
                                                        {e.eventPoCNumber && <span className="text-gray-400"> ({e.eventPoCNumber})</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Requirements */}
                                        <td className="py-4 px-4 max-w-xs">
                                            <div className="truncate text-sm text-gray-600" title={e.highlvelRequirement}>
                                                {e.highlvelRequirement || '-'}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                                            <DropdownMenu items={getDropdownItems(e)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Enquiry Modal */}
            <CreateEnquiryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingEnquiry(null)
                    setModalMode('create')
                }}
                onSubmit={handleCreateEnquiry}
                editData={editingEnquiry}
                mode={modalMode}
            />

            {viewModalOpen && selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={closeViewModal}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={closeViewModal} aria-label="Close">&times;</button>
                        <h3 className="text-xl font-semibold mb-4">Enquiry Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="text-gray-500">Title</p>
                                <p className="font-medium">{selectedEnquiry.eventName || (selectedEnquiry.title as string | undefined) || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Client</p>
                                <p className="font-medium">{clientMap.get(selectedEnquiry.client) || selectedEnquiry.client}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Enquiry Date</p>
                                <p className="font-medium">{selectedEnquiry.date ? new Date(selectedEnquiry.date).toLocaleString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Schedule</p>
                                <p className="font-medium">{selectedEnquiry.fromDate ? new Date(selectedEnquiry.fromDate).toLocaleString() : 'TBD'} → {selectedEnquiry.toDate ? new Date(selectedEnquiry.toDate).toLocaleString() : 'TBD'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Venue</p>
                                <p className="font-medium">{selectedEnquiry.venue || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Location</p>
                                <p className="font-medium">{selectedEnquiry.location || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">POC</p>
                                <p className="font-medium">{selectedEnquiry.poc || selectedEnquiry.enquiryPoC || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Assignee</p>
                                <p className="font-medium">{selectedEnquiry.assignee || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                            <Button variant="outline" onClick={closeViewModal} disabled={eventSaving}>Close</Button>
                            <Button onClick={handleCreateEvent} disabled={eventSaving} className="bg-blue-600 hover:bg-blue-700">
                                {eventSaving ? 'Creating Event...' : 'View/Create Event'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
