"use client";

interface PhoneLinkProps {
    number?: string;
}

export function PhoneLink({ number }: PhoneLinkProps) {
    if (!number) return <span className="text-muted-foreground italic text-sm">Not provided</span>;

    return (
        <a
            href={`tel:${number}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
            aria-label={`Call ${number}`}
        >
            <span>{number}</span>
        </a>
    );
}
