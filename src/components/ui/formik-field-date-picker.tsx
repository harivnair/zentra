"use client";

import { Field, FieldProps } from "formik";
import { DatePickerField, type DatePickerFieldProps } from "./date-picker";

export type { DatePickerFieldProps };

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

/**
 * Formik-connected wrapper around DatePickerField.
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
        <Field name={name}>
            {({ field, meta }: FieldProps<string>) => {
                const showError = error || (!!meta.touched && !!meta.error);
                const errorMessage = error || meta.error;

                return (
                    <DatePickerField
                        id={pickerId}
                        label={label}
                        inputClassName={inputClassName}
                        wrapperClassName={wrapperClassName}
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date, isoValue) => {
                            field.onChange({
                                target: { name, value: isoValue },
                            });
                            onChange?.(date, isoValue);
                        }}
                        error={errorMessage}
                        placeholderText={placeholderText}
                        showTimeSelect={showTimeSelect}
                        timeIntervals={timeIntervals}
                        dateFormat={dateFormat}
                        minDate={minDate}
                        maxDate={maxDate}
                        isClearable={isClearable}
                        disabled={disabled}
                        showError={showError as boolean}
                    />
                );
            }}
        </Field>
    );
}
