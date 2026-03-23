export const siteConfig = {
    name: "Zentra",
    description:
        "A modern event management platform for creating, managing, and discovering events.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ogImage: "/logo.svg",
    creator: "Zentra Team",
    keywords: [
        "events",
        "event management",
        "conferences",
        "workshops",
        "meetups",
        "ticketing",
    ] as string[],
    links: {
        github: "https://github.com/your-org/event-app",
        docs: "/docs",
        support: "/support",
    },
} as const;

export type SiteConfig = typeof siteConfig;
