"use client"

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"

type EventResponse = {
    eventName?: string
    title?: string
    eventStartDate?: string
    eventEndDate?: string
    startDate?: string
    endDate?: string
    venue?: string
    location?: string
    vendor?: {
        id?: string
        name?: string
        vendorName?: string
        items?: Array<{
            item?: string
            name?: string
            description?: string
            count?: number
            quantity?: number
            dateTime?: string
            details?: string
        }>
        advancePaid?: number
        balance?: number
        status?: string
    }
    purchaseOrders?: Array<{
        id?: string
        vendorId?: string
        vendor?: { name?: string }
        vendorName?: string
        name?: string
        items?: Array<{
            item?: string
            name?: string
            description?: string
            count?: number
            quantity?: number
            dateTime?: string
            details?: string
        }>
        advancePaid?: number
        balance?: number
        status?: string
    }>
    [key: string]: unknown
}

type VendorRow = {
    id: string
    name: string
    items: number
    advancePaid?: number
    balance?: number
    status?: string
    details?: Array<{ sn: number; elements: string; details: string; nos: number; dateTime?: string }>
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [activeTab, setActiveTab] = useState<string>("overview")
    const [eventTitle, setEventTitle] = useState<string>("Event Details")
    const [eventData, setEventData] = useState<EventResponse | null>(null)
    const [vendors, setVendors] = useState<VendorRow[]>([])
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})
    const [search, setSearch] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiRequest(`/api/events/${encodeURIComponent(String(id))}`)
                if (!res.ok) return
                const data = (await res.json()) as EventResponse

                // Store full event data
                setEventData(data)

                // Set event title
                const title = data.eventName ?? data.title ?? `Event ${id}`
                setEventTitle(String(title))

                // Extract and normalize vendor data from API response
                const vendorList: VendorRow[] = []

                // Handle vendor object (single vendor)
                if (data.vendor && typeof data.vendor === 'object') {
                    const v = data.vendor

                    // Process items - filter out entries that are completely empty
                    const validItems = Array.isArray(v.items) ? v.items.filter(item =>
                        item.item !== null ||
                        item.description !== null ||
                        (item.count !== null && item.count !== 0)
                    ) : []

                    const vendorRow: VendorRow = {
                        id: v.id ?? 'vendor-1',
                        name: v.name ?? v.vendorName ?? 'Unknown Vendor',
                        items: validItems.length,
                        advancePaid: v.advancePaid,
                        balance: v.balance,
                        status: v.status ?? 'Payment Pending',
                        details: validItems.length > 0 ? validItems.map((item, idx) => ({
                            sn: idx + 1,
                            elements: item.item ?? item.description ?? '-',
                            details: item.description ?? '-',
                            nos: item.count ?? 0,
                            dateTime: item.dateTime ?? '-'
                        })) : []
                    }
                    vendorList.push(vendorRow)
                }

                // Handle purchaseOrders array (multiple vendors)
                if (Array.isArray(data.purchaseOrders)) {
                    data.purchaseOrders.forEach((po) => {
                        // Process items - filter out entries that are completely empty
                        const validItems = Array.isArray(po.items) ? po.items.filter(item =>
                            item.item !== null ||
                            item.description !== null ||
                            (item.count !== null && item.count !== 0)
                        ) : []

                        const vendorRow: VendorRow = {
                            id: po.id ?? po.vendorId ?? `po-${Math.random()}`,
                            name: po.vendor?.name ?? po.vendorName ?? po.name ?? 'Unknown Vendor',
                            items: validItems.length,
                            advancePaid: po.advancePaid,
                            balance: po.balance,
                            status: po.status ?? 'Payment Pending',
                            details: validItems.length > 0 ? validItems.map((item, idx) => ({
                                sn: idx + 1,
                                elements: item.item ?? item.description ?? '-',
                                details: item.description ?? '-',
                                nos: item.count ?? 0,
                                dateTime: item.dateTime ?? '-'
                            })) : []
                        }
                        vendorList.push(vendorRow)
                    })
                }

                setVendors(vendorList)
            } catch {
                // ignore
            }
        }
        void load()
    }, [id])

    const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <nav className="text-sm text-muted-foreground mb-3">Events &gt; <span className="font-medium">Event Details</span></nav>
                {/* Compact header above tabs */}
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold">{eventTitle}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                <div className="border-b mb-4">
                    <ul className="flex gap-6 text-sm">
                        <li>
                            <button className={`pb-3 ${activeTab === 'overview' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('overview')}>Overview</button>
                        </li>
                        <li>
                            <button className={`pb-3 ${activeTab === 'checklist' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('checklist')}>Checklist</button>
                        </li>
                        <li>
                            <button className={`pb-3 ${activeTab === 'purchase-order' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('purchase-order')}>Purchase Order</button>
                        </li>
                        <li>
                            <button className={`pb-3 ${activeTab === 'client-bills' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('client-bills')}>Client Bills</button>
                        </li>
                        <li>
                            <button className={`pb-3 ${activeTab === 'vendor-bills' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('vendor-bills')}>Vendor Bills</button>
                        </li>
                        <li>
                            <button className={`pb-3 ${activeTab === 'expenses' ? 'border-b-2 border-black font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
                        </li>
                    </ul>
                </div>

                {/* Tab content */}
                {activeTab === 'overview' && (
                    <div className="mb-4">
                        {/* Full banner as in wireframe */}
                        <div className="rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold">{eventTitle}</h1>
                                <p className="text-sm text-gray-200 mt-1">Overview and summary information for this event.</p>
                            </div>
                        </div>

                        {eventData && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded">
                                    <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                                    <div className="font-medium">{eventData.eventStartDate ? new Date(eventData.eventStartDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }) : 'N/A'}</div>
                                </div>
                                <div className="p-4 border rounded">
                                    <div className="text-xs text-muted-foreground mb-1">End Date</div>
                                    <div className="font-medium">{eventData.eventEndDate ? new Date(eventData.eventEndDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }) : 'N/A'}</div>
                                </div>
                                <div className="p-4 border rounded">
                                    <div className="text-xs text-muted-foreground mb-1">Venue</div>
                                    <div className="font-medium">{eventData.venue ?? eventData.location ?? 'N/A'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'purchase-order' && (
                    <div>
                        <div className="mb-4 flex items-center gap-4">
                            <Input placeholder="Search Vendor" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-muted-foreground">
                                            <th className="py-3">Vendor</th>
                                            <th className="py-3">Items</th>
                                            <th className="py-3">Advance Paid</th>
                                            <th className="py-3">Balance</th>
                                            <th className="py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(v => (
                                            <React.Fragment key={v.id}>
                                                <tr className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(prev => ({ ...prev, [v.id]: !prev[v.id] }))}>
                                                    <td className="py-4 font-medium">{v.name}</td>
                                                    <td className="py-4">{v.items}</td>
                                                    <td className="py-4">₹{v.advancePaid?.toLocaleString() ?? '-'}</td>
                                                    <td className="py-4">₹{v.balance?.toLocaleString() ?? '-'}</td>
                                                    <td className="py-4"><span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800">{v.status}</span></td>
                                                </tr>
                                                {expanded[v.id] && v.details && v.details.length > 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="bg-gray-50">
                                                            <div className="p-4 border-l-2 border-gray-200">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-left text-xs text-muted-foreground">
                                                                            <th className="py-2">Sl No.</th>
                                                                            <th className="py-2">Elements</th>
                                                                            <th className="py-2">Details</th>
                                                                            <th className="py-2">Nos</th>
                                                                            <th className="py-2">Date & Time</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {v.details.map(d => (
                                                                            <tr key={d.sn} className="border-t last:border-0">
                                                                                <td className="py-2 align-middle text-xs text-muted-foreground">{d.sn}</td>
                                                                                <td className="py-2 align-middle">{d.elements}</td>
                                                                                <td className="py-2 align-middle">{d.details}</td>
                                                                                <td className="py-2 align-middle">{d.nos}</td>
                                                                                <td className="py-2 align-middle">{d.dateTime}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholder content for other tabs */}
                {activeTab === 'checklist' && <div className="py-6 text-sm text-muted-foreground">Checklist content (coming soon)</div>}
                {activeTab === 'client-bills' && <div className="py-6 text-sm text-muted-foreground">Client bills (coming soon)</div>}
                {activeTab === 'vendor-bills' && <div className="py-6 text-sm text-muted-foreground">Vendor bills (coming soon)</div>}
                {activeTab === 'expenses' && <div className="py-6 text-sm text-muted-foreground">Expenses (coming soon)</div>}
            </div>
        </div>
    )
}
