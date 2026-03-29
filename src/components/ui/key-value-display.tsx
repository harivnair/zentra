import { cn } from "@/lib/utils/cn";

export interface KeyValueItem {
    key: string;
    value: string | React.ReactNode;
    className?: string;
    keyClassName?: string;
    valueClassName?: string;
}

interface KeyValueDisplayProps {
    items: KeyValueItem[];
    columns?: 1 | 2 | 3;
    className?: string;
    keyClassName?: string;
    valueClassName?: string;
}

/**
 * A reusable key-value pair display component
 * @param items - Array of key-value pairs to display
 * @param columns - Number of columns (1, 2, or 3)
 * @param className - Additional className for the container
 * @param keyClassName - Additional className for all keys
 * @param valueClassName - Additional className for all values
 */
export function KeyValueDisplay({
    items,
    columns = 2,
    className,
    keyClassName,
    valueClassName,
}: KeyValueDisplayProps) {
    const columnClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    return (
        <div className={cn("grid gap-4", columnClasses[columns], className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        item.value === undefined || item.value === "-" || item.value === ""
                            ? "opacity-50"
                            : ""
                    )}
                >
                    {item.key && (
                        <p
                            className={cn(
                                "text-sm text-gray-500",
                                keyClassName,
                                item.keyClassName
                            )}
                        >
                            {item.key}
                        </p>
                    )}
                    <p
                        className={cn(
                            "font-medium text-gray-900",
                            valueClassName,
                            item.valueClassName
                        )}
                    >
                        {item.value !== undefined && item.value !== "" ? item.value : "-"}
                    </p>
                </div>
            ))}
        </div>
    );
}
