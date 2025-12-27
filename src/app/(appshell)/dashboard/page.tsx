"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/auth"
import { Home } from "lucide-react"
import ShortcutTile from "@/components/dashboard-shortcut-tile"

const StatCard = ({ color, value, label }: { color: string; value: string; label: string }) => (
    <div className={`rounded-lg p-4 text-gray-800 ${color} shadow-sm border border-gray-200`}>
        <div className="text-xl font-bold">{value}</div>
        <div className="mt-1 text-xs opacity-75">{label}</div>
    </div>
)

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

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
    ].sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
    })

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
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Home className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Hi, {user?.name || user?.uid || 'User'}!</h2>
                        <p className="text-muted-foreground">You have 12 Events active this week</p>
                    </div>
                </div>

                {/* Speed Dials / Shortcuts */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Access</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                        <ShortcutTile
                            label=""
                            href="/enquiries"
                            color="bg-blue-50"
                            image="enquiries_sd.png"
                        />
                        <ShortcutTile
                            label=""
                            href="/estimates"
                            color="bg-green-50"
                            image="estimates_sd.png"
                        />
                        <ShortcutTile
                            label=""
                            href="/events"
                            color="bg-purple-50"
                            image="events_sd.png"
                        />
                        <ShortcutTile
                            label=""
                            href="/clients"
                            color="bg-orange-50"
                            image="clients_sd.png"
                        />
                        <ShortcutTile
                            label=""
                            href="/expenses"
                            color="bg-red-50"
                            image="expenses_sd.png"
                        />
                        <ShortcutTile
                            label=""
                            href="/bills"
                            color="bg-indigo-50"
                            image="bills_sd.png"
                        />
                    </div>
                </div>

                {/* Analytics Summary */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {loading ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="rounded-lg p-4 border border-gray-200 shadow-sm animate-pulse">
                                        <div className="h-6 w-10 mb-2 bg-gray-200 rounded" />
                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <StatCard color="bg-purple-100" value="12" label="Upcoming Events" />
                                <StatCard color="bg-green-100" value="16" label="Pending Estimates" />
                                <StatCard color="bg-indigo-100" value="05" label="Pending Enquiries" />
                                <StatCard color="bg-emerald-100" value="12" label="Client Bills" />
                                <StatCard color="bg-rose-100" value="16" label="Vendor Bills" />
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
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
