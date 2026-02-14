"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/endpoint"
import { ProjectPlanningModal } from "@/components/project-planning-modal"
import { EstimateHistoryModal } from "@/components/estimate-history-modal"
import { ExpensesModal } from "@/components/expenses-modal"
import { toast } from "sonner"

// Event status enum matching backend
const EVENT_STATUS = [
    { value: "ENQUIRY_CREATED", label: "Enquiry created" },
    { value: "ESTIMATE_INPROGRESS", label: "Estimate in progress" },
    { value: "ESTIMATE_UNDER_REVIEW", label: "Estimate under review" },
    { value: "ESTIMATE_APPROVED", label: "Estimate approved" },
    { value: "PROJECT_INPROGRESS", label: "Project in progress" },
    { value: "PROJECT_SETTLEMENT_IN_PROGRESS", label: "Project settlement in progress" },
    { value: "PROJECT_COMPLETED", label: "Project completed" },
] as const

type EventResponse = {
    id?: string
    eventID?: string
    title?: string
    eventStartDate?: string
    eventEndDate?: string
    location?: string
    venue?: string
    status?: string
    gst?: number
    tds?: number
    advanceAmt?: number
    client?: {
        id?: string
        name?: string
        email?: string
        phone?: string
        address?: string
        poc?: string
    }
    items?: Array<{
        item?: string
        description?: string
        count?: number
        pricePerItem?: number
        vendor?: string
        days?: number
        serialNumber?: number
    }>
    categorySummary?: Array<{
        category?: string
        gst?: number
        tds?: number
        totalAmount?: number
        advanceAmount?: number
        adjustedAmt?: number
        balance?: number
    }>
    vendorSummary?: Array<unknown>
    purchaseOrders?: Array<{
        vendor?: string
        items?: Array<{
            item?: string
            description?: string
            count?: number
            pricePerItem?: number
            vendor?: string
            days?: number
            serialNumber?: number
        }>
        gst?: number
        tds?: number
        totalAmount?: number
        advanceAmount?: number
        adjustedAmt?: number
        balance?: number
    }>
    estimateId?: string
    enquiryId?: string
    [key: string]: unknown
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const router = useRouter()
    const [eventTitle, setEventTitle] = useState<string>("Event Details")
    const [eventData, setEventData] = useState<EventResponse | null>(null)
    const [isProjectPlanningModalOpen, setIsProjectPlanningModalOpen] = useState(false)
    const [isEstimateHistoryModalOpen, setIsEstimateHistoryModalOpen] = useState(false)
    const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false)
    const fetchPromiseRef = React.useRef<Promise<EventResponse | null> | null>(null)

    const fetchEventData = React.useCallback(async () => {
        try {
            // Reset the fetch promise to force a new fetch
            fetchPromiseRef.current = null

            const queryParam = String(id).includes('_') ? id : id
            fetchPromiseRef.current = (async () => {
                const res = await apiRequest(API_ENDPOINTS.events.detail(encodeURIComponent(String(queryParam))))
                if (!res.ok) return null
                return (await res.json()) as EventResponse
            })()

            const data = await fetchPromiseRef.current
            if (!data) return

            // Store full event data
            setEventData(data)

            // Set event title
            const title = data.title ?? `Event ${data.eventID || id}`
            setEventTitle(String(title))
        } catch {
            // ignore
        }
    }, [id])

    useEffect(() => {
        fetchEventData()
    }, [fetchEventData])

    // Calculate totals from categorySummary (provided by backend)
    let totalEstimatedCost = 0
    const totalExpense = 0
    const totalIncome = 0
    let totalPendingAmount = 0
    let totalBalance = 0

    if (Array.isArray(eventData?.categorySummary)) {
        eventData.categorySummary.forEach(cat => {
            totalEstimatedCost += cat.totalAmount || 0
            totalPendingAmount += cat.advanceAmount || 0
            totalBalance += cat.balance || 0
        })
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground mb-6">Project &gt; <span className="font-medium">{eventTitle}</span></nav>

            {/* Top Section: Event Info (Primary) + Client Details (Secondary) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left: Event Primary Details */}
                <div className="lg:col-span-1">
                    {/* Event Name and Details Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{eventTitle}</h2>

                        {/* Event Details List */}
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Event Name</label>
                                <p className="text-sm font-medium text-gray-900">{eventTitle}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Start Date</label>
                                <p className="text-sm font-medium text-gray-900">
                                    {eventData?.eventStartDate
                                        ? new Date(eventData.eventStartDate).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">End Date</label>
                                <p className="text-sm font-medium text-gray-900">
                                    {eventData?.eventEndDate
                                        ? new Date(eventData.eventEndDate).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Location</label>
                                <p className="text-sm font-medium text-gray-900">{eventData?.location ?? eventData?.venue ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Client Details (Secondary) */}
                <div className="lg:col-span-2">
                    {eventData?.client && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start gap-4 mb-6">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center text-white flex-shrink-0">
                                    <span className="text-3xl font-bold">{(eventData.client.name ?? 'C')[0].toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{eventData.client.name}</h3>
                                    <p className="text-sm text-gray-600">Client Details</p>
                                </div>
                            </div>

                            {/* Client Info Grid */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Name</label>
                                    <p className="text-sm font-medium text-gray-900">{eventData.client.name ?? '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Client Name</label>
                                    <p className="text-sm font-medium text-gray-900">{eventData.client.name ?? '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Contact Person</label>
                                    <p className="text-sm font-medium text-gray-900">{eventData.client.poc ?? '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Phone</label>
                                    <p className="text-sm font-medium text-gray-900">{eventData.client.phone ?? '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Status</label>
                                    <select
                                        value={eventData?.status ?? 'ENQUIRY_CREATED'}
                                        onChange={async (e) => {
                                            const newStatus = e.target.value
                                            try {
                                                const eventID = eventData?.eventID || id || ''
                                                const versionID = eventData?.version ?? 1
                                                const response = await apiRequest(API_ENDPOINTS.events.updateStatus(String(eventID), String(versionID), newStatus), {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' }
                                                })

                                                if (!response.ok) {
                                                    throw new Error('Failed to update status')
                                                }

                                                // Update local state with new status
                                                setEventData(prevData => prevData ? { ...prevData, status: newStatus } : null)
                                                toast.success('Status updated successfully')
                                            } catch (error) {
                                                console.error('Error updating status:', error)
                                                toast.error('Failed to update status')
                                            }
                                        }}
                                        className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {EVENT_STATUS.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Address</label>
                                    <p className="text-sm font-medium text-gray-900">{eventData.client.address ?? eventData.venue ?? '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Estimated Cost */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Estimated Cost</label>
                        <p className="text-2xl font-bold text-gray-900">₹{totalEstimatedCost.toLocaleString()}</p>
                    </div>

                    {/* Income */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Income</label>
                        <p className="text-2xl font-bold text-gray-900">{totalIncome}</p>
                    </div>

                    {/* Expense */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Expense</label>
                        <p className="text-2xl font-bold text-gray-900">{totalExpense}</p>
                    </div>

                    {/* Pending Amount */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Pending Amount</label>
                        <p className="text-2xl font-bold text-gray-900">₹{totalPendingAmount.toLocaleString()}</p>
                    </div>

                    {/* Pending Amount (To Pay) */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Pending Amount (To Pay)</label>
                        <p className="text-2xl font-bold text-red-600">₹{totalBalance.toLocaleString()}</p>
                    </div>

                    {/* Balance Cash In hand */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Balance Cash In hand</label>
                        <p className="text-2xl font-bold text-teal-600">₹{Math.max(0, totalIncome - totalEstimatedCost).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {/* Project Planning */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Project Planning</h4>
                    <p className="text-xs opacity-90 mb-3">Project Items</p>
                    <button
                        onClick={() => setIsProjectPlanningModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Add Items →
                    </button>
                </div>

                {/* Inventory List */}
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Inventory List</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button
                        onClick={() => router.push('/inventory')}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        View List →
                    </button>
                </div>

                {/* Estimate History */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Estimate History</h4>
                    <p className="text-xs opacity-90 mb-3">Estimates</p>
                    <button
                        onClick={() => setIsEstimateHistoryModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        View History →
                    </button>
                </div>

                {/* Expenses */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Expenses</h4>
                    <p className="text-xs opacity-90 mb-3">Manage Expenses</p>
                    <button
                        onClick={() => setIsExpensesModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Add Expenses →
                    </button>
                </div>
            </div>

            {/* Project Planning Modal */}
            <ProjectPlanningModal
                isOpen={isProjectPlanningModalOpen}
                onClose={() => setIsProjectPlanningModalOpen(false)}
                eventData={eventData || {}}
                onSave={() => {
                    // Reload event data after save
                    setIsProjectPlanningModalOpen(false)
                    fetchEventData()
                }}
            />

            {/* Estimate History Modal */}
            <EstimateHistoryModal
                isOpen={isEstimateHistoryModalOpen}
                onClose={() => setIsEstimateHistoryModalOpen(false)}
                eventTitle={eventTitle}
                eventID={eventData?.eventID || id}
            />

            {/* Expenses Modal */}
            <ExpensesModal
                isOpen={isExpensesModalOpen}
                onClose={() => setIsExpensesModalOpen(false)}
                eventData={eventData || {}}
                onSave={() => {
                    setIsExpensesModalOpen(false)
                    fetchEventData()
                }}
            />
        </div>
    )
}
