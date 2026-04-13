"use client";

import { Field, FieldProps } from "formik";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
    label: string;
    value: string;
}

export interface FormikFieldSelectProps {
    name: string;
    label?: React.ReactNode;
    selectClassName?: string;
    wrapperClassName?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: SelectOption[];
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
}

/**
 * Reusable Formik-connected select with optional label and error message.
 * Use inside <Formik><Form>...</Form></Formik>.
 */
export function FormikFieldSelect({
    name,
    label,
    selectClassName,
    wrapperClassName,
    id,
    onChange,
    options = [],
    placeholder,
    isDisabled,
    isClearable,
}: FormikFieldSelectProps) {
    const selectId = id ?? name;

    return (
        <div className={cn("grid gap-2", wrapperClassName)}>
            <Field name={name}>
                {({ field, meta }: FieldProps<string>) => {
                    const selectedOption = options.find(opt => opt.value === field.value);
                    const showError = !!meta.touched && !!meta.error;

                    return (
                        <>
                            <Select
                                label={label}
                                id={selectId}
                                value={selectedOption || null}
                                onChange={selected => {
                                    const value =
                                        selected && !Array.isArray(selected)
                                            ? (selected as SelectOption).value
                                            : "";
                                    field.onChange({ target: { name, value } });
                                    onChange?.({
                                        target: { name, value },
                                    } as React.ChangeEvent<HTMLSelectElement>);
                                }}
                                className={selectClassName}
                                options={options}
                                placeholder={placeholder}
                                isDisabled={isDisabled}
                                isClearable={isClearable}
                                error={showError ? meta.error : undefined}
                                aria-invalid={showError}
                            />
                        </>
                    );
                }}
            </Field>
        </div>
    );
}
