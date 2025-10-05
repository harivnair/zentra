"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationLoader() {
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const pathname = usePathname()

    useEffect(() => {
        setIsLoading(true)
        setProgress(0)

        // Simulate progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev // Don't go to 100% until navigation is complete
                return prev + Math.random() * 20
            })
        }, 100)

        // Complete the loading after a minimum time
        const timer = setTimeout(() => {
            setProgress(100)
            setTimeout(() => setIsLoading(false), 200) // Brief pause at 100%
        }, 500)

        return () => {
            clearInterval(interval)
            clearTimeout(timer)
        }
    }, [pathname])

    if (!isLoading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}