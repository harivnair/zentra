"use client";

import { Field, FieldProps } from "formik";
import DatePicker from "react-datepicker";
import { cn } from "@/lib/utils/cn";
import { CalendarIcon } from "lucide-react";
import { forwardRef } from "react";

export interface FormikFieldDatePickerProps {
    name: string;
    label?: React.ReactNode;
    inputClassName?: string;
    wrapperClassName?: string;
    id?: string;
    onChange?: (date: Date | null, value: string) => void;
    error?: string;
    placeholderText?: string;
    showTimeSelect?: boolean;
    timeIntervals?: number;
    dateFormat?: string;
    minDate?: Date;
    maxDate?: Date;
    isClearable?: boolean;
    disabled?: boolean;
}

const DatePickerInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    ref={ref}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 pr-10 text-sm text-foreground transition-colors",
                        "placeholder:text-muted-foreground text-xs",
                        "focus:border-accent focus:outline-none focus:ring-2 focus:ring-input-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className,
                    )}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
                <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
        );
    },
);

DatePickerInput.displayName = "DatePickerInput";

/**
 * Reusable Formik-connected DatePicker with time support and theme styling.
 * Matches the style of other FormikFieldInput components.
 * Use inside <Formik><Form>...</Form></Formik>.
 */
export function FormikFieldDatePicker({
    name,
    label,
    inputClassName,
    wrapperClassName,
    id,
    onChange,
    error,
    placeholderText = "Select date & time",
    showTimeSelect = true,
    timeIntervals = 15,
    dateFormat = "MMM d, yyyy h:mm aa",
    minDate,
    maxDate,
    isClearable,
    disabled,
}: FormikFieldDatePickerProps) {
    const pickerId = id ?? name;

    return (
        <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
            {label && (
                <label htmlFor={pickerId} className="text-sm font-medium text-foreground">
                    {label}
                </label>
            )}
            <Field name={name}>
                {({ field, meta }: FieldProps<string>) => {
                    const showError = error || (!!meta.touched && !!meta.error);
                    const errorMessage = error || meta.error;

                    const datePickerProps = {
                        selected: field.value ? new Date(field.value) : null,
                        onChange: (date: Date | null) => {
                            const isoValue = date ? date.toISOString() : "";
                            field.onChange({
                                target: { name, value: isoValue },
                            });
                            onChange?.(date, isoValue);
                        },
                        placeholderText,
                        showTimeSelect,
                        timeIntervals,
                        dateFormat,
                        minDate,
                        maxDate,
                        isClearable,
                        disabled,
                        customInput: (
                            <DatePickerInput
                                id={pickerId}
                                placeholder={placeholderText}
                                className={cn(
                                    showError &&
                                        "border-error focus:border-error focus:ring-[var(--input-error-ring)]",
                                    inputClassName,
                                )}
                                aria-invalid={
                                    showError as
                                        | boolean
                                        | "true"
                                        | "false"
                                        | "grammar"
                                        | "spelling"
                                        | undefined
                                }
                                aria-describedby={showError ? `${pickerId}-error` : undefined}
                            />
                        ),
                        popperClassName: "z-50",
                    };

                    return (
                        <>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <DatePicker {...(datePickerProps as any)} />
                            {errorMessage && (
                                <p id={`${pickerId}-error`} className="text-xs text-error">
                                    {errorMessage}
                                </p>
                            )}
                        </>
                    );
                }}
            </Field>
        </div>
    );
}
