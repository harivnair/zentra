import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={selectId} className="text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        "flex h-10 w-full appearance-none rounded-lg border border-input bg-surface px-3 py-2 pr-8 text-sm text-foreground transition-colors",
                        "bg-[length:16px_16px] bg-[position:right_0.5rem_center] bg-no-repeat",
                        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238A7B85%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                        "focus:border-accent focus:outline-none focus:ring-2 focus:ring-input-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error &&
                            "border-error focus:border-error focus:ring-[var(--input-error-ring)]",
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${selectId}-error` : undefined}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p id={`${selectId}-error`} className="text-sm text-error">
                        {error}
                    </p>
                )}
                {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
