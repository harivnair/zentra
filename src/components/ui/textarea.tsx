import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string | React.ReactNode;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, id, name, ...props }, ref) => {
        const textareaId = id ?? name;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    name={name}
                    className={cn(
                        "flex min-h-[100px] w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm text-foreground transition-colors",
                        "placeholder:text-muted-foreground",
                        "focus:border-accent focus:outline-none focus:ring-2 focus:ring-input-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "resize-y",
                        error &&
                            "border-error focus:border-error focus:ring-[var(--input-error-ring)]",
                        className,
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="text-sm text-error">
                        {error}
                    </p>
                )}
                {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
            </div>
        );
    },
);

Textarea.displayName = "Textarea";
