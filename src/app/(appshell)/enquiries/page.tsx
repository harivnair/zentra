"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { useEnquiries } from "@/context/enquiries"

const StatusPill = ({ status }: { status: string }) => {
    const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
    if (status === "In Progress") return <span className={base + " bg-yellow-100 text-yellow-800"}>{status}</span>
    return <span className={base + " bg-gray-200 text-gray-700"}>{status}</span>
}

const MemoStatusPill = React.memo(StatusPill)

export default function EnquiriesPage() {
    const [tab, setTab] = useState<"open" | "cancelled" | "closed">("open")

    const { enquiries, loading, error } = useEnquiries()

    const filtered = useMemo(() => enquiries.filter((e) => {
        if (tab === "open") return e.status !== "Cancelled" && e.status !== "Closed"
        if (tab === "cancelled") return e.status === "Cancelled"
        return e.status === "Closed"
    }), [enquiries, tab])

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
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/enquiries/create">+ Create New Enquiry</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                {/* (debug output removed) */}
                <nav className="flex gap-6 border-b">
                    <button
                        onClick={() => setTab("open")}
                        className={`pb-3 text-sm font-medium ${tab === "open" ? "border-b-2 border-black" : "text-muted-foreground"} cursor-pointer`}>
                        Open
                    </button>
                    <button
                        onClick={() => setTab("cancelled")}
                        className={`pb-3 text-sm font-medium ${tab === "cancelled" ? "border-b-2 border-black" : "text-muted-foreground"} cursor-pointer`}>
                        Cancelled
                    </button>
                    <button
                        onClick={() => setTab("closed")}
                        className={`pb-3 text-sm font-medium ${tab === "closed" ? "border-b-2 border-black" : "text-muted-foreground"} cursor-pointer`}>
                        Closed
                    </button>
                </nav>

                <div className="mt-6 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                    {/* Mobile / small screens: stacked cards */}
                    <div className="flex flex-col gap-4 md:hidden">
                        {loading && <div className="p-4">Loading...</div>}
                        {error && <div className="p-4 text-red-600">{error}</div>}
                        {!loading && !error && filtered.length === 0 && (
                            <div className="p-4 text-muted-foreground">No enquiries found.</div>
                        )}

                        {filtered.map((e) => (
                            <div key={e.id} className="border rounded-md p-4 cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{e.client}</div>
                                    <div><StatusPill status={e.status} /></div>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">{e.date} · {e.poc}</div>
                                <div className="mt-3 text-sm">Assignee: <span className="font-medium">{e.assignee}</span></div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: table view */}
                    <div className="hidden md:block">
                        {loading && <div className="p-4">Loading...</div>}
                        {error && <div className="p-4 text-red-600">{error}</div>}
                        {!loading && !error && filtered.length === 0 && (
                            <div className="p-4 text-muted-foreground">No enquiries found.</div>
                        )}
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
                                {filtered.map((e) => (
                                    <tr key={e.id} className="border-t hover:bg-gray-50 cursor-pointer">
                                        <td className="py-4">{e.client}</td>
                                        <td className="py-4">{e.date}</td>
                                        <td className="py-4">{e.poc}</td>
                                        <td className="py-4"><MemoStatusPill status={e.status} /></td>
                                        <td className="py-4">{e.assignee}</td>
                                        <td className="py-4 text-right">⋮</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
