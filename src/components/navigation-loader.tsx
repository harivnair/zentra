"use client"

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * NavigationLoader
 *
 * Shows a progress bar at the top of the screen while navigating between pages.
 * The bar starts immediately when pathname begins changing (triggered by the
 * sidebar's click handler via a custom event), and completes once the new
 * pathname is actually committed.
 */
export default function NavigationLoader() {
    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const pathname = usePathname()
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearTimers = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }

    const startLoading = () => {
        clearTimers()
        setProgress(0)
        setVisible(true)

        // Ramp up to ~85% quickly, then slow down — mimics real loading feel
        intervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) return prev
                const increment = prev < 30 ? 15 : prev < 60 ? 8 : 3
                return Math.min(prev + increment, 85)
            })
        }, 120)
    }

    const completeLoading = () => {
        clearTimers()
        setProgress(100)
        hideTimerRef.current = setTimeout(() => setVisible(false), 300)
    }

    // Listen for the custom "nav-start" event emitted by sidebar links on click
    useEffect(() => {
        const onNavStart = () => startLoading()
        window.addEventListener('nav-start', onNavStart)
        return () => window.removeEventListener('nav-start', onNavStart)
    }, [])

    // When pathname actually changes, the navigation is complete
    useEffect(() => {
        completeLoading()
    }, [pathname])

    if (!visible) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div
                className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}