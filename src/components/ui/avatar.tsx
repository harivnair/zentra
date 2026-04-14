export const AVATAR_COLORS = [
    "bg-primary text-primary-foreground",
    "bg-accent text-accent-foreground",
    "bg-info text-white",
    "bg-success text-white",
    "bg-warning text-white",
    "bg-secondary text-secondary-foreground",
];

function getUserNameInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function getColorForName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name, useDefaultColor }: { name: string; useDefaultColor?: boolean }) {
    const initials = getUserNameInitials(name);
    const colorClass = useDefaultColor ? AVATAR_COLORS[0] : getColorForName(name);

    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
            aria-hidden="true"
        >
            {initials}
        </div>
    );
}
