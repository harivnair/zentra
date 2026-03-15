"use client"

import { Field, ErrorMessage, FieldProps } from "formik"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormikFieldInputProps
    extends Omit<
        React.ComponentProps<"input">,
        "name" | "value" | "onChange" | "onBlur"
    > {
    name: string
    label?: React.ReactNode
    labelClassName?: string
    inputClassName?: string
    errorMessageClassName?: string
    wrapperClassName?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Reusable Formik-connected input with optional label and error message.
 * Use inside <Formik><Form>...</Form></Formik>.
 */
export function FormikFieldInput({
    name,
    label,
    labelClassName,
    inputClassName,
    errorMessageClassName,
    wrapperClassName,
    id,
    onChange,
    ...inputProps
}: FormikFieldInputProps) {
    const inputId = id ?? name

    return (
        <div className={cn("grid gap-2", wrapperClassName)}>
            {label != null && (
                <Label
                    className={cn("text-sm", labelClassName)}
                    htmlFor={inputId}
                >
                    {label}
                </Label>
            )}
            <Field name={name}>
                {({ field, meta }: FieldProps<string>) => (
                    <Input
                        id={inputId}
                        {...inputProps}
                        {...field}
                        onChange={onChange}
                        className={cn(
                            "focus:ring-2 focus:ring-green-400 focus:border-green-400 placeholder:text-xs",
                            inputClassName
                        )}
                        aria-invalid={meta.touched && !!meta.error}
                    />
                )}
            </Field>
            <ErrorMessage name={name}>
                {(msg) => (
                    <p
                        className={cn(
                            "text-xs text-red-600",
                            errorMessageClassName
                        )}
                    >
                        {msg}
                    </p>
                )}
            </ErrorMessage>
        </div>
    )
}
