import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US",
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(amount);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "...";
}

export function pluralize(count: number, singular: string, plural?: string): string {
    return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function calculatePercentageAmount(amount: number, percentage: number): number {
    return (amount * percentage) / 100;
}
