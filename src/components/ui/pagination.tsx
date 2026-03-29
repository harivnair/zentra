import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    itemName?: string;
}

export interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    className?: string;
}

function getPageNumbers(pagination: PaginationInfo): (number | string)[] {
    const { currentPage, totalPages } = pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            pages.push(1, 2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage, "...", totalPages);
        }
    }

    return pages;
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
    const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
    const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

    return (
        <div
            className={cn(
                "flex items-center justify-between border-t border-border px-4 py-4 sm:px-6",
                className,
            )}
        >
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startItem}</span>-
                <span className="font-semibold text-foreground">{endItem}</span> of{" "}
                <span className="font-semibold text-foreground">{pagination.totalItems}</span>{" "}
                {pagination.itemName || "items"}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    className="h-8 w-8 p-0"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Button>
                {getPageNumbers(pagination).map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                        >
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === pagination.currentPage ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                "h-8 w-8 p-0",
                                page === pagination.currentPage &&
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                            )}
                        >
                            {page}
                        </Button>
                    ),
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    className="h-8 w-8 p-0"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
