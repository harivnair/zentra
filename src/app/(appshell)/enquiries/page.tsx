"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import DropdownMenu from "@/components/ui/dropdown-menu"
import CreateEnquiryModal from "@/components/create-enquiry-modal"
import { EnquiryFormData } from "@/types/enquiry"

import { useEnquiries } from "@/context/enquiries"
import { useClients } from "@/hooks/useClients"
import { ListSkeleton, TableRowSkeleton } from "@/components/skeleton-loader"

type Enquiry = {
    id: number | string
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
    [k: string]: unknown
}

const StatusPill = ({ status }: { status: string }) => {
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (status === "In Progress") return <span className={base + " bg-yellow-100 text-yellow-800"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700"}>{status}</span>
}

const MemoStatusPill = React.memo(StatusPill)

export default function EnquiriesPage() {
    const [tab, setTab] = useState<"open" | "cancelled" | "closed">("open")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEnquiry, setEditingEnquiry] = useState<EnquiryFormData | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

    const { enquiries, loading, error, refresh } = useEnquiries()
    const { clients, refresh: refreshClients, loading: clientsLoading } = useClients()

    // Create a map of client ID to client name
    const clientMap = useMemo(() => {
        const map = new Map<string, string>()
        clients.forEach(client => map.set(client.id, client.name))
        return map
    }, [clients])

    // compute counts per status and filter strictly by status
    const counts = useMemo(() => {
        const c = { open: 0, cancelled: 0, closed: 0 }
        for (const e of enquiries) {
            const s = String(e.status ?? '').trim().toLowerCase()
            if (s === 'open') c.open++
            else if (s === 'cancelled') c.cancelled++
            else if (s === 'closed') c.closed++
        }
        return c
    }, [enquiries])

    const filtered = useMemo(() => enquiries.filter((e) => {
        const s = String(e.status ?? '').trim().toLowerCase()
        if (tab === "open") return s === 'open'
        if (tab === "cancelled") return s === 'cancelled'
        return s === 'closed'
    }), [enquiries, tab])

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
            eventPoC: enquiry.eventPoC || ''
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
        const confirmed = window.confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")
        if (confirmed) {
            try {
                console.log("Delete enquiry:", id)
                const res = await fetch(`/api/enquiries/${encodeURIComponent(id)}`, {
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

                    alert(`Enquiry ${id} deleted.`)
                } else {
                    // Try to surface backend message if any
                    const errText = await res.text().catch(() => '')
                    console.error('Delete failed, status:', res.status, 'body:', errText)
                    throw new Error(`Failed to delete enquiry: ${res.status} ${errText}`)
                }
            } catch (error) {
                alert("Failed to delete enquiry. Please try again.")
                console.error("Error deleting enquiry:", error)
            }
        }
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

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-md bg-yellow-100 flex items-center justify-center">📨</div>
                    <div>
                        <h2 className="text-2xl font-bold">Hi, Arun!</h2>
                        <p className="text-muted-foreground">You have 1 Open Enquiry this week</p>
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
                <nav className="flex gap-6 border-b">
                    {(() => {
                        const disabledOpen = counts.open === 0
                        return (
                            <button
                                onClick={() => !disabledOpen && setTab("open")}
                                aria-disabled={disabledOpen}
                                title={disabledOpen ? 'No Open enquiries yet' : undefined}
                                className={`pb-3 text-sm font-medium ${tab === "open" ? "border-b-2 border-black" : "text-muted-foreground"} ${disabledOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                Open
                            </button>
                        )
                    })()}

                    {(() => {
                        const disabledCancelled = counts.cancelled === 0
                        return (
                            <button
                                onClick={() => !disabledCancelled && setTab("cancelled")}
                                aria-disabled={disabledCancelled}
                                title={disabledCancelled ? 'No Cancelled enquiries yet' : undefined}
                                className={`pb-3 text-sm font-medium ${tab === "cancelled" ? "border-b-2 border-black" : "text-muted-foreground"} ${disabledCancelled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                Cancelled
                            </button>
                        )
                    })()}

                    {(() => {
                        const disabledClosed = counts.closed === 0
                        return (
                            <button
                                onClick={() => !disabledClosed && setTab("closed")}
                                aria-disabled={disabledClosed}
                                title={disabledClosed ? 'No Closed enquiries yet' : undefined}
                                className={`pb-3 text-sm font-medium ${tab === "closed" ? "border-b-2 border-black" : "text-muted-foreground"} ${disabledClosed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                Closed
                            </button>
                        )
                    })()}
                </nav>

                <div className="mt-6 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                    {/* Mobile / small screens: stacked cards */}
                    <div className="flex flex-col gap-4 md:hidden">
                        {(loading || clientsLoading) && <ListSkeleton type="cards" items={5} />}
                        {error && <div className="p-4 text-red-600">{error}</div>}
                        {!loading && !clientsLoading && !error && filtered.length === 0 && (
                            <div className="p-4 text-muted-foreground">No enquiries found.</div>
                        )}

                        {!loading && !clientsLoading && !error && filtered.map((e) => (
                            <div key={e.id} className="border rounded-md p-4 cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{clientMap.get(e.client) || e.client}</div>
                                    <div className="flex items-center gap-2">
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
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="py-3">Client Name</th>
                                    <th className="py-3">Enquiry Date</th>
                                    <th className="py-3">Client POC</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Assignee</th>
                                    <th className="py-3 text-right">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(loading || clientsLoading) && <TableRowSkeleton rows={8} />}
                                {error && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !clientsLoading && !error && filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No enquiries found.
                                        </td>
                                    </tr>
                                )}
                                {!loading && !clientsLoading && !error && filtered.map((e) => (
                                    <tr key={e.id} className="border-t hover:bg-gray-50">
                                        <td className="py-4">{clientMap.get(e.client) || e.client}</td>
                                        <td className="py-4">{e.date}</td>
                                        <td className="py-4">{e.poc}</td>
                                        <td className="py-4"><MemoStatusPill status={e.status} /></td>
                                        <td className="py-4">{e.assignee}</td>
                                        <td className="py-4 text-right">
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
        </div>
    )
}
