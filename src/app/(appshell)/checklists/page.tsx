"use client"

import React, { useState } from "react"
import CreateChecklistModal from "../../components/create-checklist-modal"
import DropdownMenu from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth"
import { showConfirmation } from "@/components/confirmation-toast"

type ChecklistRow = {
    id: string
    eventName: string
    enquiryDate: string
    clientPoc: string
    status: "In Progress" | "Not Started" | "Completed"
    gst?: string
}

const INITIAL_DATA: ChecklistRow[] = [
    { id: "1", eventName: "Annual Gala Dinner", enquiryDate: "2025-06-25", clientPoc: "Invoice Creation", status: "In Progress", gst: "GSTIN1234" },
    { id: "2", eventName: "Annual Gala Dinner", enquiryDate: "2025-06-25", clientPoc: "Invoice Creation", status: "In Progress", gst: "GSTIN1234" },
    { id: "3", eventName: "Annual Gala Dinner", enquiryDate: "2025-06-25", clientPoc: "Invoice Creation", status: "Not Started", gst: "GSTIN5678" },
    { id: "4", eventName: "Annual Gala Dinner", enquiryDate: "2025-06-25", clientPoc: "Invoice Creation", status: "Not Started", gst: "GSTIN9012" },
]

const StatusPill = ({ status }: { status?: string }) => {
    const s = String(status ?? '').toLowerCase()
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (s === 'in progress' || s === 'in_progress' || s === 'ongoing') return <span className={base + " bg-yellow-100 text-yellow-800"}>{status}</span>
    if (s === 'completed' || s === 'done') return <span className={base + " bg-green-100 text-green-800"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700"}>{status ?? 'Not Started'}</span>
}

export default function ChecklistsPage() {
    const { user } = useAuth()
    const [rows, setRows] = useState<ChecklistRow[]>(INITIAL_DATA)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filtered = rows // placeholder: later filter by tab/status

    function handleSave(newRow: Omit<ChecklistRow, "id">) {
        const id = String(Date.now())
        setRows((prev) => [{ id, ...newRow }, ...prev])
        setIsModalOpen(false)
    }

    function handleDelete(id: string) {
        showConfirmation({
            title: 'Delete Checklist',
            description: 'Are you sure you want to delete this checklist? This action cannot be undone.',
            onConfirm: async () => {
                setRows(prev => prev.filter(r => r.id !== id))
            },
            confirmLabel: 'Delete',
            confirmingLabel: 'Deleting...'
        })
    }

    const getDropdownItems = (row: ChecklistRow) => [
        { label: 'View', icon: '🔍', action: () => window.location.href = `/checklists/${row.id}` },
        { label: 'Edit', icon: '✏️', action: () => setIsModalOpen(true) },
        { label: 'Delete', icon: '🗑️', action: () => handleDelete(row.id), variant: 'danger' as const }
    ]

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <CreateChecklistModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 text-2xl">🗒️</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Hi, {user?.name || user?.uid || 'User'}!</h2>
                        <p className="text-muted-foreground">All checklists and their status</p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto">
                    <Button className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>+ Create Checklist</Button>
                </div>
            </div>

            <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                <div className="hidden md:block">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="py-3">Event Name</th>
                                <th className="py-3">Enquiry Date</th>
                                <th className="py-3">Client POC</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">GST</th>
                                <th className="py-3 text-right">&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No checklists found.</td>
                                </tr>
                            )}
                            {filtered.map((row) => (
                                <tr key={row.id} className="border-t hover:bg-gray-50">
                                    <td className="py-4">{row.eventName}</td>
                                    <td className="py-4 text-muted-foreground">{row.enquiryDate}</td>
                                    <td className="py-4 text-muted-foreground">{row.clientPoc}</td>
                                    <td className="py-4"><StatusPill status={row.status} /></td>
                                    <td className="py-4 text-gray-700">{row.gst}</td>
                                    <td className="py-4 text-right"><DropdownMenu items={getDropdownItems(row)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="flex flex-col gap-4 md:hidden">
                    {filtered.length === 0 && (
                        <div className="p-4 text-muted-foreground">No checklists found.</div>
                    )}
                    {filtered.map((row) => (
                        <div key={row.id} className="border rounded-md p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-medium">{row.eventName}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{row.clientPoc}</div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <StatusPill status={row.status} />
                                    <DropdownMenu items={getDropdownItems(row)} />
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground">{row.enquiryDate} · {row.gst}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
