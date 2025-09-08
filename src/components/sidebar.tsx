"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
    const pathname = usePathname() || "/"

    // avoid hydration mismatch: render sidebar only on the client after mount
    const [isClient, setIsClient] = useState(false)
    useEffect(() => setIsClient(true), [])
    if (!isClient) return null

    // hide sidebar on login route (and its subroutes)
    if (pathname === "/login" || pathname.startsWith("/login/")) return null

    type NavItem = { href: string; label: string }

    const topItems: NavItem[] = [{ href: "/", label: "Dashboard" }]
    const operations: NavItem[] = [
        { href: "/enquiries", label: "Enquiries" },
        { href: "/events", label: "Events" },
        { href: "/schedules", label: "Schedules" },
        { href: "/checklists", label: "Checklists" },
    ]
    const finance: NavItem[] = [
        { href: "/estimates", label: "Estimates" },
        { href: "/expenses", label: "Expenses" },
        { href: "/bills", label: "Bills" },
        { href: "/reports", label: "Reports" },
    ]
    const stakeholders: NavItem[] = [
        { href: "/clients", label: "Clients" },
        { href: "/vendors", label: "Vendors" },
    ]

    function linkClass(active?: boolean) {
        return `block px-3 py-2 rounded ${active ? "bg-white/10" : "hover:bg-white/10"}`
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

    return (
        <aside className="hidden md:flex w-64 flex-col bg-gray-700 text-white py-8 px-6 rounded-tr-3xl rounded-br-3xl h-screen">
            <div className="mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center">O</div>
                <span className="font-semibold text-lg">zentra</span>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <nav className="flex flex-col gap-2 text-sm">
                    {topItems.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            {it.label}
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Operations</div>
                    {operations.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            {it.label}
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Finance</div>
                    {finance.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            {it.label}
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Stakeholders</div>
                    {stakeholders.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))}>
                            {it.label}
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
