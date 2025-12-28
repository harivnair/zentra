"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FileText, Calendar, Grid, DollarSign, BookOpen, CreditCard, BarChart2, Users, Truck, LogOut, Package } from 'lucide-react'
import { useAuth } from "@/context/auth"
import { toast } from "sonner"

export default function Sidebar() {
    const pathname = usePathname() || "/"
    const router = useRouter()
    const { logout } = useAuth()
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        router.push('/login')
    }

    // Render immediately; Next.js hydration mismatch is not an issue for this sidebar

    // hide sidebar on login route (and its subroutes)
    // (render decision is made after hooks to avoid violating the Rules of Hooks)

    type NavItem = { href: string; label: string; Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }

    const topItems: NavItem[] = [{ href: "/dashboard", label: "Dashboard", Icon: Home }]

    const salesAndMarketing: NavItem[] = [
        { href: "/enquiries", label: "Enquiries", Icon: FileText },
        { href: "/clients", label: "Clients", Icon: Users },
        { href: "/vendors", label: "Vendors", Icon: Truck },
    ]

    const operations: NavItem[] = [
        { href: "/events", label: "Events", Icon: Calendar },
        { href: "/schedules", label: "Schedules", Icon: Grid },
        { href: "/checklists", label: "Checklists", Icon: Grid },
        { href: "/inventory", label: "Inventory", Icon: Package },
    ]
    const finance: NavItem[] = [
        { href: "/estimates", label: "Estimates", Icon: DollarSign },
        { href: "/expenses", label: "Expenses", Icon: BookOpen },
        { href: "/bills", label: "Bills", Icon: CreditCard },
        { href: "/reports", label: "Reports", Icon: BarChart2 },
    ]

    function linkClass(active?: boolean) {
        return `block px-3 py-2 rounded ${active ? "bg-white/10" : "hover:bg-white/10"}`
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

    useEffect(() => {
        // clear navigating indicator when route actually changes
        setNavigatingTo(null)
    }, [pathname])

    // hide sidebar on login route (and its subroutes)
    if (pathname === "/login" || pathname.startsWith("/login/")) return null

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
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))} onClick={() => setNavigatingTo(it.href)}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                                {navigatingTo === it.href && (
                                    <svg className="animate-spin h-4 w-4 ml-2 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                )}
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Sales & Marketing</div>
                    {salesAndMarketing.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))} onClick={() => setNavigatingTo(it.href)}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                                {navigatingTo === it.href && (
                                    <svg className="animate-spin h-4 w-4 ml-2 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                )}
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Operations</div>
                    {operations.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))} onClick={() => setNavigatingTo(it.href)}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                                {navigatingTo === it.href && (
                                    <svg className="animate-spin h-4 w-4 ml-2 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                )}
                            </div>
                        </Link>
                    ))}

                    <div className="mt-4 text-xs text-white/60 uppercase">Finance</div>
                    {finance.map((it) => (
                        <Link key={it.href} href={it.href} className={linkClass(isActive(it.href))} onClick={() => setNavigatingTo(it.href)}>
                            <div className="flex items-center gap-2">
                                {it.Icon && <it.Icon className="w-4 h-4 opacity-90" />}
                                <span>{it.label}</span>
                                {navigatingTo === it.href && (
                                    <svg className="animate-spin h-4 w-4 ml-2 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-left"
                >
                    <LogOut className="w-4 h-4 opacity-90" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
