"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/auth"
import Link from "next/link"
import { Calendar, FileText, DollarSign, Users, BookOpen, CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import ShortcutTile from "@/components/dashboard-shortcut-tile"

const stats = [
    { label: "Upcoming Events", value: "12", icon: Calendar, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
    { label: "Pending Estimates", value: "16", icon: FileText, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { label: "Open Enquiries", value: "05", icon: AlertCircle, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { label: "Client Bills", value: "12", icon: CreditCard, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
    { label: "Active This Week", value: "08", icon: TrendingUp, color: "bg-rose-50 text-rose-600", border: "border-rose-100" },
]

const recent = [
    { name: "Annual Gala Dinner", date: "June 25, 2025", task: "Invoice Creation", status: "Closed", assignee: "Athel Mathew" },
    { name: "Allianz Annual Day", date: "July 28, 2025", task: "Tag Collection", status: "Closed", assignee: "Anand Menon" },
    { name: "Experion Team Meet", date: "August 14, 2025", task: "Venue Updates", status: "Open", assignee: "Sherin John" },
    { name: "Spring Gala", date: "August 14, 2025", task: "Guest Confirmation", status: "Open", assignee: "Athel Mathew" },
    { name: "IBM Annual Day", date: "September 14, 2025", task: "Deciding Venue", status: "Cancelled", assignee: "Shilpa Kumar" },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

const STATUS_STYLES: Record<string, string> = {
    Open: "bg-amber-50 text-amber-700 border border-amber-200",
    Closed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border border-red-200",
}

const shortcuts = [
    { label: "Enquiries", href: "/enquiries", image: "enquiries_sd.png", color: "bg-blue-50" },
    { label: "Estimates", href: "/estimates", image: "estimates_sd.png", color: "bg-emerald-50" },
    { label: "Events", href: "/events", image: "events_sd.png", color: "bg-violet-50" },
    { label: "Clients", href: "/clients", image: "clients_sd.png", color: "bg-orange-50" },
    { label: "Expenses", href: "/expenses", image: "expenses_sd.png", color: "bg-rose-50" },
    { label: "Bills", href: "/bills", image: "bills_sd.png", color: "bg-indigo-50" },
]

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 900)
        return () => clearTimeout(timer)
    }, [])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    return (
        <div className="min-h-screen p-6 md:p-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name || user?.uid || 'Welcome back'}!</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening today across your events.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 stagger-children">
                {loading
                    ? [...Array(5)].map((_, i) => (
                        <div key={i} className="surface rounded-xl p-4 animate-pulse">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 mb-3" />
                            <div className="h-6 w-10 bg-gray-100 rounded mb-1.5" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                        </div>
                    ))
                    : stats.map(s => (
                        <div key={s.label} className="surface surface-hover lift press rounded-xl p-4 cursor-default">
                            <div className={`h-9 w-9 rounded-lg ${s.color} flex items-center justify-center mb-3 border ${s.border}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 leading-none mb-1 animate-count-up">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    ))
                }
            </div>

            {/* Quick Access */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800">Quick Access</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 stagger-children">
                    {shortcuts.map(s => (
                        <ShortcutTile key={s.href} label={s.label} href={s.href} color={s.color} image={s.image} />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="surface rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
                    </div>
                    <Link href="/events" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">View all →</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full data-table">
                        <thead>
                            <tr className="text-left">
                                <th>Event</th>
                                <th>Date</th>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Assignee</th>
                            </tr>
                        </thead>
                        <tbody className="stagger-rows">
                            {recent.map((r) => (
                                <tr key={r.name} className="cursor-pointer">
                                    <td className="font-medium text-gray-900">{r.name}</td>
                                    <td className="text-muted-foreground">{r.date}</td>
                                    <td className="text-muted-foreground">{r.task}</td>
                                    <td>
                                        <span className={`status-pill ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {r.status === 'Closed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-semibold text-indigo-700 shrink-0">
                                                {r.assignee[0]}
                                            </div>
                                            <span className="text-gray-700">{r.assignee}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
