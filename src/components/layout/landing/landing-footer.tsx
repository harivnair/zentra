import Link from "next/link";
import { siteConfig } from "@/config/site";

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} {siteConfig.name}. All rights reserved.
                    </p>
                    <nav className="flex gap-6">
                        <Link
                            href="/privacy"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
