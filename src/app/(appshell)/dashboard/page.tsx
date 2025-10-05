"use client"

import React, { useState, useEffect } from "react"
import { ListSkeleton } from "@/components/skeleton-loader"

const StatCard = ({ color, value, label }: { color: string; value: string; label: string }) => (
    <div className={`rounded-lg p-6 text-gray-800 ${color} shadow-md border border-gray-200`}>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-2 text-sm opacity-75">{label}</div>
    </div>
)

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    const recent = [
        { name: "Annual Gala Dinner", date: "June 25, 2025", task: "Invoice Creation", status: "Closed", assignee: "Athel Mathew" },
        { name: "Allianz Annual Day", date: "July 28, 2025", task: "Tag Collection", status: "Closed", assignee: "Anand Menon" },
        { name: "Experion Team Meet", date: "August 14, 2025", task: "Venue Updates", status: "Open", assignee: "Sherin John" },
        { name: "Spring Gala", date: "August 14, 2025", task: "Guest Confirmation", status: "Open", assignee: "Athel Mathew" },
        { name: "IBM Annual Day", date: "September 14, 2025", task: "Deciding Venue", status: "Cancelled", assignee: "Shilpa Kumar" },
    ]

    const statusPill = (s: string) => {
        const base = "inline-block rounded-full px-3 py-1 text-sm font-medium"
        if (s === "Open") return <span className={base + " bg-yellow-100 text-yellow-800"}>{s}</span>
        if (s === "Closed") return <span className={base + " bg-green-100 text-green-800"}>{s}</span>
        if (s === "Cancelled") return <span className={base + " bg-red-100 text-red-800"}>{s}</span>
        return <span className={base + " bg-gray-200 text-gray-700"}>{s}</span>
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            <main className="flex-1 p-6 md:p-8">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-md bg-yellow-100 flex items-center justify-center">📊</div>
                    <div>
                        <h2 className="text-2xl font-bold">Hi, Arun!</h2>
                        <p className="text-muted-foreground">You have 12 Events active this week</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {loading ? (
                        <ListSkeleton type="stats" count={5} />
                    ) : (
                        <>
                            <StatCard color="bg-purple-200" value="12" label="Upcoming Events" />
                            <StatCard color="bg-green-200" value="16" label="Pending Estimates" />
                            <StatCard color="bg-indigo-200" value="05" label="Pending Enquiries" />
                            <StatCard color="bg-emerald-200" value="12" label="Pending Client Bills" />
                            <StatCard color="bg-rose-200" value="16" label="Pending Vendor Bills" />
                        </>
                    )}
                </div>

                <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="py-3">Event Name</th>
                                    <th className="py-3">Event Date</th>
                                    <th className="py-3">Task</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((r) => (
                                    <tr key={r.name} className="border-t hover:bg-gray-50">
                                        <td className="py-4">{r.name}</td>
                                        <td className="py-4">{r.date}</td>
                                        <td className="py-4">{r.task}</td>
                                        <td className="py-4">{statusPill(r.status)}</td>
                                        <td className="py-4">{r.assignee}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
