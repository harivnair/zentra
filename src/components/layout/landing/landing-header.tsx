import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { landingMainNav } from "@/config/nav";
import { LandingMobileMenu } from "./landing-mobile-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
                {/* Left: Logo + Desktop nav */}
                <div className="flex items-center gap-6 lg:gap-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl"
                    >
                        <Image
                            src="/logo.svg"
                            alt={`${siteConfig.name} logo`}
                            width={28}
                            height={28}
                            className="shrink-0 sm:h-8 sm:w-8"
                        />
                        <span className="xs:inline">{siteConfig.name}</span>
                    </Link>
                    <nav className="hidden items-center gap-5 md:flex lg:gap-6">
                        {landingMainNav.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Theme + Auth (desktop) + Hamburger (mobile) */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>
                    <Link
                        href="/login"
                        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
                    >
                        Sign up
                    </Link>
                    <LandingMobileMenu />
                </div>
            </div>
        </header>
    );
}
