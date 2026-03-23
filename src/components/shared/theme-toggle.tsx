"use client";

import { useTheme, type Theme } from "@/context/theme-provider";
import { cn } from "@/lib/utils/cn";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/ui/icons";

const ORDER: Theme[] = ["light", "dark", "system"];

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    const next = () => {
        const idx = ORDER.indexOf(theme);
        setTheme(ORDER[(idx + 1) % ORDER.length]);
    };

    return (
        <button
            onClick={next}
            className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                className
            )}
            title={`Theme: ${theme}`}
            aria-label={`Switch theme (current: ${theme})`}
        >
            {theme === "light" && <SunIcon size={16} />}
            {theme === "dark" && <MoonIcon size={16} />}
            {theme === "system" && <MonitorIcon size={16} />}
        </button>
    );
}
