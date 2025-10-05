"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Calendar, Grid, DollarSign, BookOpen, CreditCard, BarChart2, Users, Truck } from 'lucide-react'

export default function Sidebar() {
    const pathname = usePathname() || "/"

    // avoid hydration mismatch: render sidebar only on the client after mount
    const [isClient, setIsClient] = useState(false)
    useEffect(() => setIsClient(true), [])
    if (!isClient) return null

    // hide sidebar on login route (and its subroutes)
    if (pathname === "/login" || pathname.startsWith("/login/")) return null

    type NavItem = { href: string; label: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }

    const topItems: NavItem[] = [{ href: "/dashboard", label: "Dashboard", Icon: Home }]
    const operations: NavItem[] = [
        { href: "/enquiries", label: "Enquiries", Icon: FileText },
        { href: "/events", label: "Events", Icon: Calendar },
        { href: "/schedules", label: "Schedules", Icon: Grid },
        { href: "/checklists", label: "Checklists", Icon: Grid },
    ]
    const finance: NavItem[] = [
        { href: "/estimates", label: "Estimates", Icon: DollarSign },
        { href: "/expenses", label: "Expenses", Icon: BookOpen },
        { href: "/bills", label: "Bills", Icon: CreditCard },
        { href: "/reports", label: "Reports", Icon: BarChart2 },
    ]
    const stakeholders: NavItem[] = [
        { href: "/clients", label: "Clients", Icon: Users },
        { href: "/vendors", label: "Vendors", Icon: Truck },
    ]

    function linkClass(active?: boolean) {
        return `block px-3 py-2 rounded ${active ? "bg-white/10" : "hover:bg-white/10"}`
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

    return (
        <aside className="hidden md:flex w-64 flex-col bg-gray-700 text-white py-8 px-6 rounded-tr-3xl rounded-br-3xl min-h-screen">
            <div className="mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-white/30 flex items-center justify-center bg-white/5">
                    {/* logo */}
                    <Image src="/zentra-logo.jpg" alt="zentra" width={40} height={40} className="object-cover" />
                </div>
                <span className="font-semibold text-lg">zentra</span>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <nav className="flex flex-col gap-2 text-sm">
                    {topItems.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Operations</div>
                    {operations.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Finance</div>
                    {finance.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Stakeholders</div>
                    {stakeholders.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-4">
                <Link href="/logout" className="block px-3 py-2 rounded hover:bg-white/10">Logout</Link>
            </div>
        </aside>
    )
}
