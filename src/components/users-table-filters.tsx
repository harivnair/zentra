"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { userRoleOptions, userSortOptions } from "@/constants/user";
import { FormikProps } from "formik";
import { UsersTableFiltersFormValues } from "@/types/user";

interface UsersTableFiltersProps {
    formik: FormikProps<UsersTableFiltersFormValues>;
    className?: string;
    onReset?: () => void;
}

export function UsersTableFilters({ formik, className, onReset }: UsersTableFiltersProps) {
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
                        placeholder="Search by name, email, or username..."
                        value={values.search}
                        onChange={formik.handleChange}
                        name="search"
                        className="pl-9 h-10"
                    />
                </div>

                {/* Role Filter */}
                <div className="sm:w-[160px]">
                    <Select
                        options={userRoleOptions}
                        value={
                            values.role
                                ? userRoleOptions.find(r => r.value === values.role) || null
                                : null
                        }
                        onChange={option => setFieldValue("role", option?.value || "")}
                        placeholder="Roles"
                        className="h-10"
                    />
                </div>

                {/* Sort By Dropdown */}
                <div className="sm:w-[160px]">
                    <Select
                        options={userSortOptions}
                        value={
                            values.sortBy
                                ? userSortOptions.find(s => s.value === values.sortBy) || null
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
                        onClick={handleSortOrderToggle}
                        className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        title={"Reset Filters"}
                    >
                        <RefreshCw className="h-4 w-4" onClick={onReset} />
                    </button>
                )}
            </div>
        </div>
    );
}
