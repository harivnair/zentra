import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Pagination, type PaginationInfo } from "@/components/ui/pagination";
import { Loading } from "./loading";

export interface Column<T> {
    key: string;
    header: string;
    render: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    hidden?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: (row: T) => string;
    emptyMessage?: string;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
    className?: string;
    pagination?: PaginationInfo;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
}

export function DataTable<T>({
    columns,
    data,
    rowKey,
    emptyMessage = "No data available.",
    striped = false,
    hoverable = true,
    compact = false,
    className,
    pagination,
    onPageChange,
    isLoading = false,
}: DataTableProps<T>) {
    const visibleColumns = columns.filter(col => !col.hidden);

    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            {visibleColumns.map(col => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                                        compact ? "px-3 py-2" : "px-4 py-3 sm:px-6",
                                        col.headerClassName,
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length}
                                    className="px-4 py-12 text-center"
                                >
                                    <Loading />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr
                                    key={rowKey(row)}
                                    className={cn(
                                        hoverable && "transition-colors hover:bg-muted/50",
                                        striped && i % 2 === 1 && "bg-muted/30",
                                    )}
                                >
                                    {visibleColumns.map(col => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                "whitespace-nowrap text-sm text-foreground",
                                                compact ? "px-3 py-2" : "px-4 py-3 sm:px-6",
                                                col.className,
                                            )}
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length}
                                    className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {pagination && onPageChange && (
                <div className="mt-4">
                    <Pagination pagination={pagination} onPageChange={onPageChange} />
                </div>
            )}
        </div>
    );
}
