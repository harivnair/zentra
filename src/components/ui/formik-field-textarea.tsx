"use client";

import { Field, FieldProps } from "formik";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

export interface FormikFieldTextAreaProps extends Omit<
    React.ComponentProps<"textarea">,
    "name" | "value" | "onChange" | "onBlur"
> {
    name: string;
    label?: React.ReactNode;
    textareaClassName?: string;
    wrapperClassName?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Reusable Formik-connected textarea with optional label and error message.
 * Use inside <Formik><Form>...</Form></Formik>.
 */
export function FormikFieldTextArea({
    name,
    label,
    textareaClassName,
    wrapperClassName,
    id,
    onChange,
    ...textareaProps
}: FormikFieldTextAreaProps) {
    const textareaId = id ?? name;

    return (
        <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
            <Field name={name}>
                {({ field, meta }: FieldProps<string>) => {
                    const showError = !!meta.touched && !!meta.error;

                    return (
                        <Textarea
                            label={label}
                            id={textareaId}
                            {...textareaProps}
                            {...field}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                field.onChange(e);
                                onChange?.(e);
                            }}
                            className={textareaClassName}
                            error={showError ? meta.error : undefined}
                            aria-invalid={showError}
                        />
                    );
                }}
            </Field>
        </div>
    );
}
