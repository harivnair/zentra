"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils";

export interface CostSummaryBreakdownItem {
    label: string;
    amount: number;
    tone?: "default" | "positive" | "negative";
    prefix?: string;
}

interface CostSummaryProps {
    title: string;
    subtitle: string;
    amount: number;
    breakdownTitle: string;
    items: CostSummaryBreakdownItem[];
    totalItem?: CostSummaryBreakdownItem;
    formatAmount?: (amount: number) => string;
    toggleAriaLabel?: string;
    className?: string;
    breakdownClassName?: string;
    footer?: ReactNode;
}

function formatBreakdownValue(
    item: CostSummaryBreakdownItem,
    formatAmount: (amount: number) => string,
) {
    const formatted = formatAmount(Math.abs(item.amount));
    return item.prefix ? `${item.prefix}${formatted}` : formatted;
}

function breakdownToneClass(tone: CostSummaryBreakdownItem["tone"]) {
    switch (tone) {
        case "positive":
            return "text-success";
        case "negative":
            return "text-destructive";
        default:
            return "";
    }
}

export function CostSummary({
    title,
    subtitle,
    amount,
    breakdownTitle,
    items,
    totalItem,
    formatAmount = formatCurrency,
    toggleAriaLabel = "Toggle cost breakdown",
    className,
    breakdownClassName,
    footer,
}: CostSummaryProps) {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const highlightedTotal = totalItem ?? {
        label: title,
        amount,
    };

    return (
        <>
            <div
                className={cn(
                    "flex items-center gap-4 bg-primary/[0.04] rounded-xl px-5 py-3 border border-primary/10",
                    className,
                )}
            >
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <span className="text-xl font-extrabold text-primary tracking-tight">
                    {formatAmount(amount)}
                </span>
                <button
                    type="button"
                    onClick={() => setShowBreakdown(open => !open)}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    aria-label={toggleAriaLabel}
                    aria-expanded={showBreakdown}
                >
                    {showBreakdown ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
            </div>
            {showBreakdown && (
                <div
                    className={cn(
                        "absolute bottom-20 left-5 bg-surface border border-border rounded-xl shadow-xl p-4 z-50 w-72",
                        breakdownClassName,
                    )}
                >
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        {breakdownTitle}
                    </p>
                    <div className="space-y-2 text-sm">
                        {items.map(item => (
                            <div key={item.label} className="flex justify-between">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span
                                    className={cn(
                                        "font-medium",
                                        breakdownToneClass(item.tone),
                                    )}
                                >
                                    {formatBreakdownValue(item, formatAmount)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t border-border pt-2 flex justify-between font-bold text-primary">
                            <span>{highlightedTotal.label}</span>
                            <span>{formatAmount(highlightedTotal.amount)}</span>
                        </div>
                        {footer}
                    </div>
                </div>
            )}
        </>
    );
}
