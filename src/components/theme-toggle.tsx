"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch by waiting until mounted
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="flex items-center justify-center p-2 rounded-xl glass text-slate-500 transition-colors w-9 h-9">
                <Sun className="h-4 w-4 opacity-50" />
            </button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 w-9 h-9 glass hover:bg-black/5 dark:hover:bg-white/10 overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="absolute inset-0 z-0 reveal reveal-light dark:reveal-dark" />

            <div className="relative z-10 flex text-slate-700 dark:text-slate-300 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                {isDark ? (
                    <Moon className="h-4 w-4 transition-transform hover:scale-110" />
                ) : (
                    <Sun className="h-4 w-4 transition-transform hover:scale-110" />
                )}
            </div>
        </button>
    )
}
