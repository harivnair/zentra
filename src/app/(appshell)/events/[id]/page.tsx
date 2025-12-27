"use client"

import React, { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api-client"

type EventResponse = {
    id?: string
    title?: string
    eventStartDate?: string
    eventEndDate?: string
    location?: string
    venue?: string
    status?: string
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
    const [eventTitle, setEventTitle] = useState<string>("Event Details")
    const [eventData, setEventData] = useState<EventResponse | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiRequest(`/api/events/${encodeURIComponent(String(id))}`)
                if (!res.ok) return
                const data = (await res.json()) as EventResponse

                // Store full event data
                setEventData(data)

                // Set event title
                const title = data.title ?? `Event ${id}`
                setEventTitle(String(title))
            } catch {
                // ignore
            }
        }
        void load()
    }, [id])

    // Calculate totals
    let totalEstimatedCost = 0
    const totalExpense = 0
    const totalIncome = 0
    let totalPendingAmount = 0
    let totalBalance = 0

    if (Array.isArray(eventData?.purchaseOrders)) {
        eventData.purchaseOrders.forEach(po => {
            totalEstimatedCost += po.totalAmount || 0
            totalPendingAmount += po.advanceAmount || 0
            totalBalance += po.balance || 0
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
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
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
                                    <p className="text-sm font-medium text-gray-900">{eventData.status ?? 'Pending'}</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
                {/* Project Planning */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Project Planning</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View Report →</button>
                </div>

                {/* Income */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Income</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View Report →</button>
                </div>

                {/* Expense */}
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Expense</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View Report →</button>
                </div>

                {/* Cash Book */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Cash Book</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View Report →</button>
                </div>

                {/* Purchase */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Purchase</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View Report →</button>
                </div>

                {/* Purchase Order */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Purchase Order</h4>
                    <p className="text-xs opacity-90 mb-3">List</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View List →</button>
                </div>

                {/* Inventory */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Inventory</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View List →</button>
                </div>

                {/* Inventory List */}
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Inventory List</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View List →</button>
                </div>

                {/* Task */}
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Task</h4>
                    <p className="text-xs opacity-90 mb-3">List</p>
                    <button className="text-xs font-medium hover:opacity-90 transition-opacity">View List →</button>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-sm p-4 mb-8">
                <h4 className="font-semibold text-sm mb-2">Documents</h4>
                <p className="text-xs opacity-90 mb-3">List</p>
                <button className="text-xs font-medium hover:opacity-90 transition-opacity">View List →</button>
            </div>
        </div>
    )
}
