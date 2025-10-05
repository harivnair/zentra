"use client"

import React from "react"
import Link from "next/link"

export default function ReportsPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-xl text-center">
                <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-yellow-50 mb-6 animate-pulse">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-600">
                        <path d="M3 21h18L12 2 3 21z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2">Reports — Coming Soon</h1>
                <p className="text-muted-foreground mb-6">We&apos;re working on Reports. Check back soon.</p>

                <div className="flex justify-center gap-3">
                    <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Go to Dashboard</Link>
                </div>
            </div>
        </div>
    )
}
