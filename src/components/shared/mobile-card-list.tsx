import type { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui";
import { Pagination, type PaginationInfo } from "@/components/ui/pagination";
import { Loading } from "../ui/loading";

export interface MobileCardItem<T> {
    id: string;
    data: T;
}

export interface MobileCardListProps<T> {
    items: MobileCardItem<T>[];
    renderHeader: (item: T) => ReactNode;
    renderContent: (item: T) => ReactNode;
    renderActions?: (item: T) => ReactNode;
    emptyMessage?: string;
    className?: string;
    pagination?: PaginationInfo;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
}

export function MobileCardList<T>({
    items,
    renderHeader,
    renderContent,
    renderActions,
    emptyMessage = "No items found.",
    className,
    pagination,
    onPageChange,
    isLoading = false,
}: MobileCardListProps<T>) {
    return (
        <div className={className}>
            {isLoading ? (
                <Loading className="py-12" />
            ) : items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        {items.map(item => (
                            <Card key={item.id} variant="elevated">
                                <CardHeader>{renderHeader(item.data)}</CardHeader>
                                <CardContent>{renderContent(item.data)}</CardContent>
                                {renderActions && (
                                    <CardFooter>{renderActions(item.data)}</CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                    {pagination && onPageChange && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={onPageChange}
                            className="mt-4"
                        />
                    )}
                </>
            )}
        </div>
    );
}
