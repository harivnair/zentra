import Link from "next/link";

const ACTIONS = [
    { title: "Create Enquiry", href: "/enquiries", image: "/enquiry.svg" },
    { title: "New Estimate", href: "/estimates", image: "/estimate.svg" },
    { title: "Book Event", href: "/events/create", image: "/event.svg" },
    { title: "Generate Bill", href: "/bills", image: "/bill.svg" },
    { title: "Add Client", href: "/clients", image: "/client.svg" },
    { title: "View Reports", href: "/reports", image: "/expense.svg" },
];

export function QuickActions() {
    return (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm sm:rounded-xl sm:p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4">
                Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4">
                {ACTIONS.map(action => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group relative aspect-square overflow-hidden rounded-xl transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {/* Stacked layers behind */}
                        <span className="absolute inset-0 translate-y-1.5 rounded-xl border border-border bg-surface opacity-40" />
                        <span className="absolute inset-0 translate-y-[5px] rounded-xl border border-border bg-surface opacity-60" />

                        {/* Front card with full background image */}
                        <span
                            className="absolute inset-0 rounded-xl border border-border bg-surface shadow-sm transition-shadow group-hover:shadow-md"
                            style={{
                                backgroundImage: `url(${action.image})`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                            }}
                        />

                        {/* Label overlay at bottom */}
                        <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-surface/80 px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-foreground backdrop-blur-sm sm:text-xs">
                            {action.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
