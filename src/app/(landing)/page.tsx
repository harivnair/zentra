import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/layout";
import { LandingFooter } from "@/components/layout";
import { Button } from "@/components/ui";
import { siteConfig } from "@/config/site";
import {
    CalendarDaysIcon,
    TicketIcon,
    ChartLineIcon,
    UsersRoundIcon,
    GlobeIcon,
    ShieldIcon,
    CheckIcon,
    ArrowRightIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
    title: `${siteConfig.name} — Discover & Create Unforgettable Events`,
    description: siteConfig.description,
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const features = [
    {
        icon: CalendarDaysIcon,
        title: "Event Creation",
        description:
            "Build stunning event pages in minutes with our intuitive editor. Add schedules, speakers, and rich media.",
    },
    {
        icon: TicketIcon,
        title: "Smart Ticketing",
        description:
            "Flexible ticket tiers, early-bird pricing, discount codes, and real-time inventory management.",
    },
    {
        icon: ChartLineIcon,
        title: "Live Analytics",
        description:
            "Track registrations, revenue, and attendee engagement with real-time dashboards and reports.",
    },
    {
        icon: UsersRoundIcon,
        title: "Attendee Management",
        description:
            "Check-in tools, attendee communication, and CRM integration to manage your audience effortlessly.",
    },
    {
        icon: GlobeIcon,
        title: "Hybrid & Virtual",
        description:
            "Host in-person, online, or hybrid events with built-in streaming links and virtual lobby support.",
    },
    {
        icon: ShieldIcon,
        title: "Secure & Reliable",
        description:
            "Enterprise-grade security, 99.9% uptime, and PCI-compliant payment processing you can trust.",
    },
];

const steps = [
    {
        number: "01",
        title: "Create your event",
        description:
            "Set up your event page with all the details — dates, location, tickets, and branding.",
    },
    {
        number: "02",
        title: "Share & promote",
        description:
            "Share your custom event link via social media, email, or embed it directly on your website.",
    },
    {
        number: "03",
        title: "Manage & grow",
        description:
            "Track sales, manage attendees, and use insights to make every event better than the last.",
    },
];

const stats = [
    { value: "50K+", label: "Events hosted" },
    { value: "2M+", label: "Tickets sold" },
    { value: "120+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />

            <main className="flex flex-1 flex-col">
                {/* ── Hero ────────────────────────────────────────────────────── */}
                <section className="relative isolate overflow-hidden">
                    {/* Decorative gradient blobs */}
                    <div
                        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[800px] sm:w-[800px]"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -bottom-24 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl"
                        aria-hidden
                    />

                    <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-36">
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                            <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
                            Now in public beta
                        </div>

                        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                            Discover &amp; Create{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Unforgettable
                            </span>{" "}
                            Events
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                            {siteConfig.description} From intimate workshops to large-scale
                            conferences — all in one platform.
                        </p>

                        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Get Started Free
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/events" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    Browse Events
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-4 text-xs text-muted-foreground">
                            No credit card required &middot; Free plan available
                        </p>

                        {/* Hero banner image */}
                        <div className="mx-auto mt-14 max-w-5xl sm:mt-16 lg:mt-20">
                            <div className="relative rounded-xl border border-border bg-surface p-2 shadow-2xl sm:rounded-2xl sm:p-3">
                                <Image
                                    src="/banner.svg"
                                    alt="EventHub platform preview"
                                    width={1200}
                                    height={600}
                                    className="w-full rounded-lg sm:rounded-xl"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats bar ───────────────────────────────────────────────── */}
                <section className="border-y border-border bg-surface">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
                        {stats.map(stat => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center text-center"
                            >
                                <span className="text-3xl font-extrabold text-foreground sm:text-4xl">
                                    {stat.value}
                                </span>
                                <span className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Features grid ───────────────────────────────────────────── */}
                <section
                    id="features"
                    className="bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                                Features
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                                Everything you need to run world-class events
                            </h2>
                            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                                A complete toolkit for event organizers — from creation to
                                post-event analytics.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {features.map(feature => (
                                <div
                                    key={feature.title}
                                    className="group rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-lg sm:p-8"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── How it works ────────────────────────────────────────────── */}
                <section className="border-t border-border bg-muted px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                                How it works
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                                Up and running in minutes
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-8 sm:mt-16 md:grid-cols-3 md:gap-12">
                            {steps.map(step => (
                                <div
                                    key={step.number}
                                    className="relative flex flex-col items-center text-center md:items-start md:text-left"
                                >
                                    <span className="text-5xl font-extrabold text-primary/15 sm:text-6xl">
                                        {step.number}
                                    </span>
                                    <h3 className="-mt-2 text-lg font-semibold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing teaser / Why choose us ──────────────────────────── */}
                <section className="bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-10 rounded-2xl border border-border bg-surface p-8 sm:p-12 lg:flex-row lg:items-center lg:gap-16 lg:p-16">
                            <div className="flex-1">
                                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                                    Why EventHub
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                                    Built for organizers who care about the details
                                </h2>
                                <ul className="mt-6 flex flex-col gap-3">
                                    {[
                                        "Unlimited events on every plan",
                                        "No per-ticket platform fees",
                                        "Custom branding & white-label options",
                                        "24/7 priority support",
                                        "GDPR & SOC 2 compliant",
                                    ].map(item => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base"
                                        >
                                            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col items-center gap-4 rounded-xl bg-primary-light p-8 text-center lg:min-w-[320px]">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Start free, upgrade anytime
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-foreground">
                                        $0
                                    </span>
                                    <span className="text-muted-foreground">/mo</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Up to 3 events &middot; 100 attendees each
                                </p>
                                <Link href="/register" className="w-full">
                                    <Button size="lg" className="w-full">
                                        Start for Free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ───────────────────────────────────────────────── */}
                <section className="relative isolate overflow-hidden border-t border-border bg-primary px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"
                        aria-hidden
                    />

                    <div className="mx-auto max-w-2xl">
                        <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl">
                            Ready to create your next event?
                        </h2>
                        <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
                            Join thousands of organizers already using {siteConfig.name} to bring
                            people together.
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full bg-white text-primary shadow-md hover:bg-white/90 sm:w-auto"
                                >
                                    Get Started Free
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/events" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 sm:w-auto"
                                >
                                    Explore Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
