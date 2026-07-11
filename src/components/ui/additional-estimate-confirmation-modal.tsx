"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { GroupedCategory, GroupedItem } from "@/lib/utils/artifact-utils";
import {
    ItemComparisonResult,
    MatchStatus,
    compareAdditionalEstimateItems,
    summarizeComparisonResults,
} from "@/lib/utils/estimate-comparison";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function WarningIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
    MatchStatus,
    {
        label: string;
        icon: React.ReactNode;
        iconColor: string;
        badgeClasses: string;
    }
> = {
    "exact-match": {
        label: "Exact Match",
        icon: <CheckCircleIcon />,
        iconColor: "text-emerald-600",
        badgeClasses: "bg-emerald-100 text-emerald-800",
    },
    "quantity-changed": {
        label: "Quantity Changed",
        icon: <WarningIcon />,
        iconColor: "text-amber-600",
        badgeClasses: "bg-amber-200 text-amber-800",
    },
    "partial-match": {
        label: "Modified Item",
        icon: <WarningIcon />,
        iconColor: "text-orange-600",
        badgeClasses: "bg-orange-100 text-orange-800",
    },
    "new-item": {
        label: "New Item",
        icon: <PlusIcon />,
        iconColor: "text-blue-600",
        badgeClasses: "bg-blue-100 text-blue-800",
    },
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AdditionalEstimateConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    existingEventItems: GroupedCategory[];
    newEstimateItems: GroupedCategory[];
    loading?: boolean;
    error?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Item row                                                          */
/* ------------------------------------------------------------------ */

function ExistingItemRow({ item }: { item: GroupedItem }) {
    return (
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-2 rounded-md bg-surface p-2 text-xs">
            <div className="min-w-0">
                <span className="block truncate font-medium text-foreground">{item.item}</span>
                {item.specification && (
                    <span className="mt-0.5 block truncate text-muted-foreground">
                        {item.specification}
                    </span>
                )}
            </div>
            <div className="self-center text-right">{item.sqft}</div>
            <div className="self-center text-right">{item.days}</div>
            <div className="self-center text-right">{item.rate}</div>
            <div className="self-center text-right">
                {(item.days * item.sqft * item.rate).toFixed(2)}
            </div>
        </div>
    );
}

function NewItemRow({ result }: { result: ItemComparisonResult }) {
    const { item, status, message } = result;
    const config = STATUS_CONFIG[status];
    const hasWarning =
        status === "quantity-changed" || status === "partial-match" || status === "exact-match";

    return (
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-2 rounded-md bg-surface p-2 text-xs">
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    {hasWarning && message ? (
                        <Tooltip content={message}>
                            <span
                                tabIndex={0}
                                role="button"
                                aria-label={config.label + ": " + message}
                                className={`inline-flex cursor-pointer outline-none focus:outline-none ${config.iconColor}`}
                            >
                                {config.icon}
                            </span>
                        </Tooltip>
                    ) : status === "new-item" ? (
                        <span className={`inline-flex ${config.iconColor}`}>{config.icon}</span>
                    ) : null}
                    <span className="truncate font-medium text-foreground">{item.item}</span>
                </div>
                <span
                    className={`mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.badgeClasses}`}
                >
                    {config.label}
                </span>
            </div>
            <div className="self-center text-right">{item.sqft}</div>
            <div className="self-center text-right">{item.days}</div>
            <div className="self-center text-right">{item.rate}</div>
            <div className="self-center text-right">
                {(item.days * item.sqft * item.rate).toFixed(2)}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Items list for a section                                           */
/* ------------------------------------------------------------------ */

function ExistingItemsList({ items }: { items: GroupedItem[] }) {
    if (!items.length) {
        return <p className="text-xs text-muted-foreground">No items in this section.</p>;
    }

    return (
        <div className="space-y-2">
            {items.map(item => (
                <ExistingItemRow key={item.id} item={item} />
            ))}
        </div>
    );
}

function NewItemsList({
    items,
    category,
    subCategory,
    resultsByKey,
}: {
    items: GroupedItem[];
    category: string;
    subCategory: string;
    resultsByKey: Map<string, ItemComparisonResult>;
}) {
    if (!items.length) {
        return <p className="text-xs text-muted-foreground">No items in this section.</p>;
    }

    return (
        <div className="space-y-2">
            {items.map(groupedItem => {
                const key = `${category}::${subCategory}::${groupedItem.item}`.toLowerCase().trim();
                const result = resultsByKey.get(key);
                // Fallback: if no comparison result found, show as new item
                if (!result) return <ExistingItemRow key={groupedItem.id} item={groupedItem} />;
                return <NewItemRow key={groupedItem.id} result={result} />;
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Category section                                                  */
/* ------------------------------------------------------------------ */

function CategorySection({
    category,
    side,
    resultsByKey,
}: {
    category: GroupedCategory;
    side: "existing" | "new";
    resultsByKey: Map<string, ItemComparisonResult>;
}) {
    const totalItems =
        category.directItems.length +
        category.subCategories.reduce((sum, sub) => sum + sub.items.length, 0);

    return (
        <div key={category.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-foreground">{category.name}</h4>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-primary">
                    {totalItems} items
                </span>
            </div>
            {side === "existing" ? (
                <ExistingItemsList items={category.directItems} />
            ) : (
                <NewItemsList
                    items={category.directItems}
                    category={category.name}
                    subCategory=""
                    resultsByKey={resultsByKey}
                />
            )}
            {category.subCategories.map(sub => (
                <div key={sub.id} className="mt-4 rounded-xl border border-border bg-surface p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {sub.name}
                    </div>
                    {side === "existing" ? (
                        <ExistingItemsList items={sub.items} />
                    ) : (
                        <NewItemsList
                            items={sub.items}
                            category={category.name}
                            subCategory={sub.name}
                            resultsByKey={resultsByKey}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Summary banner                                                     */
/* ------------------------------------------------------------------ */

function ComparisonSummaryBanner({ results }: { results: ItemComparisonResult[] }) {
    const summary = useMemo(() => summarizeComparisonResults(results), [results]);

    const warnings = results.filter(
        r =>
            r.status === "quantity-changed" ||
            r.status === "partial-match" ||
            r.status === "exact-match",
    );

    if (warnings.length === 0) return null;

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-amber-800">
                <WarningIcon className="h-4 w-4 text-amber-700" />
                <span>
                    Review Required — {warnings.length} item{warnings.length > 1 ? "s" : ""} matched
                    existing items
                </span>
            </div>
            <ul className="ml-1 space-y-1 text-amber-700">
                {summary.exactMatchCount > 0 && (
                    <li className="flex items-center gap-2">
                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>
                            {summary.exactMatchCount} item{summary.exactMatchCount > 1 ? "s" : ""}{" "}
                            already exist with identical details.
                        </span>
                    </li>
                )}
                {summary.quantityChangedCount > 0 && (
                    <li className="flex items-center gap-2">
                        <WarningIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>
                            {summary.quantityChangedCount} item
                            {summary.quantityChangedCount > 1 ? "s" : ""} match an existing item but
                            have a different quantity.
                        </span>
                    </li>
                )}
                {summary.partialMatchCount > 0 && (
                    <li className="flex items-center gap-2">
                        <WarningIcon className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                        <span>
                            {summary.partialMatchCount} item
                            {summary.partialMatchCount > 1 ? "s" : ""} match an existing item name
                            but have different Specification, Days, or Rate.
                        </span>
                    </li>
                )}
            </ul>
            <p className="mt-2 text-xs text-amber-600">
                Review the highlighted items below before confirming.
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main modal component                                              */
/* ------------------------------------------------------------------ */

export default function AdditionalEstimateConfirmationModal({
    open,
    onClose,
    onConfirm,
    existingEventItems,
    newEstimateItems,
    loading = false,
    error = null,
}: AdditionalEstimateConfirmationModalProps) {
    const comparisonResults = useMemo(
        () => compareAdditionalEstimateItems(existingEventItems, newEstimateItems),
        [existingEventItems, newEstimateItems],
    );

    const resultsByKey = useMemo(() => {
        const map = new Map<string, ItemComparisonResult>();
        for (const result of comparisonResults) {
            const { item } = result;
            const key = `${item.category}::${item.subCategory}::${item.item}`.toLowerCase().trim();
            map.set(key, result);
        }
        return map;
    }, [comparisonResults]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xxl"
            title="Confirm Additional Estimate"
            description="Review existing finalized event items and the new items before saving the additional estimate."
            showCloseIcon
        >
            <ModalBody>
                {loading && (
                    <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
                        Loading existing event items…
                    </div>
                )}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && comparisonResults.length > 0 && (
                    <ComparisonSummaryBanner results={comparisonResults} />
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {/* Left panel — Existing items */}
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-900">
                            Existing Finalized Event Items
                        </div>
                        {existingEventItems.length === 0 ? (
                            <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
                                No existing event items found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {existingEventItems.map(cat => (
                                    <CategorySection
                                        key={cat.id}
                                        category={cat}
                                        side="existing"
                                        resultsByKey={resultsByKey}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right panel — New items */}
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-900">
                            New Additional Estimate Items
                        </div>
                        {newEstimateItems.length === 0 ? (
                            <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
                                No new items have been added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {newEstimateItems.map(cat => (
                                    <CategorySection
                                        key={cat.id}
                                        category={cat}
                                        side="new"
                                        resultsByKey={resultsByKey}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    Back to Estimate
                </Button>
                <Button variant="primary" onClick={onConfirm} disabled={loading}>
                    Confirm and Save
                </Button>
            </ModalFooter>
        </Modal>
    );
}
