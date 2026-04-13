"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FormikProps } from "formik";
import { EnquiriesTableFiltersFormValues } from "@/types/enquiry";

export const enquirySortOptions = [
    { label: "Created Date", value: "enquiryDate" },
    { label: "Event Name", value: "eventName" },
    { label: "Client", value: "clientName" },
    { label: "Status", value: "status" },
];

export const enquiryStatusOptions = [
    { label: "Open", value: "OPEN" },
    { label: "Closed", value: "CLOSED" },
    { label: "In Progress", value: "IN_PROGRESS" },
];

interface EnquiriesTableFiltersProps {
    formik: FormikProps<EnquiriesTableFiltersFormValues>;
    className?: string;
    onReset?: () => void;
}

export function EnquiriesTableFilters({ formik, className, onReset }: EnquiriesTableFiltersProps) {
    const { values, setFieldValue } = formik;

    const handleSortOrderToggle = () => {
        setFieldValue("sortOrder", values.sortOrder === "asc" ? "desc" : "asc");
    };

    return (
        <div className={cn("rounded-lg bg-surface p-4 shadow-sm", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by event name, client, or title..."
                        value={values.search}
                        onChange={formik.handleChange}
                        name="search"
                        className="pl-9 h-10"
                    />
                </div>

                {/* Status Filter */}
                <div className="sm:w-[160px]">
                    <Select
                        options={enquiryStatusOptions}
                        value={
                            values.status
                                ? enquiryStatusOptions.find(s => s.value === values.status) || null
                                : null
                        }
                        onChange={option => setFieldValue("status", option?.value || "")}
                        placeholder="Status"
                        className="h-10"
                    />
                </div>

                {/* Sort By Dropdown */}
                <div className="sm:w-[160px]">
                    <Select
                        options={enquirySortOptions}
                        value={
                            values.sortBy
                                ? enquirySortOptions.find(s => s.value === values.sortBy) || null
                                : null
                        }
                        onChange={option => setFieldValue("sortBy", option?.value || "")}
                        placeholder="Sort By"
                        className="h-10"
                    />
                </div>

                {/* Sort Order Toggle */}
                <button
                    type="button"
                    onClick={handleSortOrderToggle}
                    className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title={values.sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                    {values.sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )}
                </button>

                {/* Reset Button */}
                {onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        title={"Reset Filters"}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
