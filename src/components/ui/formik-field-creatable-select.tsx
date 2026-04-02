"use client";

import { Field, FieldProps } from "formik";
import CreatableSelect from "react-select/creatable";
import { cn } from "@/lib/utils/cn";
import { components, ControlProps, MenuProps, OptionProps } from "react-select";

export interface SelectOption {
    label: string;
    value: string;
}

export interface FormikFieldCreatableSelectProps {
    name: string;
    label?: React.ReactNode;
    selectClassName?: string;
    wrapperClassName?: string;
    id?: string;
    onChange?: (value: string) => void;
    onCreateOption?: (value: string) => void;
    options?: SelectOption[];
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
    value?: SelectOption | null;
}

const CustomControl = ({ children, ...props }: ControlProps<SelectOption>) => (
    <components.Control {...props}>{children}</components.Control>
);

const CustomMenu = ({ children, ...props }: MenuProps<SelectOption>) => (
    <components.Menu {...props}>{children}</components.Menu>
);

const CustomOption = ({ children, ...props }: OptionProps<SelectOption>) => (
    <components.Option {...props}>{children}</components.Option>
);

/**
 * Reusable Formik-connected CreatableSelect with theme styling.
 * Allows creating new options when none match.
 * Use inside <Formik><Form>...</Form></Formik>.
 */
export function FormikFieldCreatableSelect({
    name,
    label,
    selectClassName,
    wrapperClassName,
    id,
    onChange,
    onCreateOption,
    options = [],
    placeholder,
    isDisabled,
    isClearable,
    value,
}: FormikFieldCreatableSelectProps) {
    const selectId = id ?? name;

    return (
        <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
            {label && <label className="text-sm font-medium text-foreground">{label}</label>}
            <Field name={name}>
                {({ field, meta }: FieldProps<string>) => {
                    const showError = !!meta.touched && !!meta.error;
                    const errorMessage = meta.error;

                    // Find the selected option from options list or use the value prop
                    const selectedOption = value
                        ? value
                        : options.find(opt => opt.value === field.value);

                    return (
                        <>
                            <CreatableSelect
                                inputId={selectId}
                                value={selectedOption || null}
                                onChange={selected => {
                                    const selectedValue =
                                        selected && !Array.isArray(selected)
                                            ? (selected as SelectOption).value
                                            : "";
                                    field.onChange({ target: { name, value: selectedValue } });
                                    onChange?.(selectedValue);
                                }}
                                onCreateOption={inputValue => {
                                    field.onChange({ target: { name, value: inputValue } });
                                    onCreateOption?.(inputValue);
                                }}
                                options={options}
                                placeholder={placeholder}
                                isDisabled={isDisabled}
                                isClearable={isClearable}
                                className={cn(selectClassName)}
                                styles={{
                                    container: (provided, _state) => ({
                                        ...provided,
                                        width: "100%",
                                    }),
                                    control: (provided, state) => ({
                                        ...provided,
                                        minHeight: "40px",
                                        backgroundColor: "var(--surface)",
                                        borderColor: showError
                                            ? "var(--error)"
                                            : state.isFocused
                                              ? "var(--accent)"
                                              : "var(--border)",
                                        boxShadow: state.isFocused
                                            ? `0 0 0 2px ${showError ? "var(--input-error-ring)" : "var(--input-focus-ring)"}`
                                            : "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        "&:hover": {
                                            borderColor: showError
                                                ? "var(--error)"
                                                : state.isFocused
                                                  ? "var(--accent)"
                                                  : "var(--border-hover)",
                                        },
                                    }),
                                    singleValue: (provided, _state) => ({
                                        ...provided,
                                        color: "var(--foreground)",
                                        fontSize: "12px",
                                    }),
                                    placeholder: (provided, _state) => ({
                                        ...provided,
                                        color: "var(--muted-foreground)",
                                        fontSize: "12px",
                                    }),
                                    input: (provided, _state) => ({
                                        ...provided,
                                        color: "var(--foreground)",
                                        margin: 0,
                                        padding: 0,
                                    }),
                                    dropdownIndicator: (provided, _state) => ({
                                        ...provided,
                                        color: "var(--muted-foreground)",
                                        "&:hover": {
                                            color: "var(--accent)",
                                        },
                                    }),
                                    indicatorSeparator: (provided, _state) => ({
                                        ...provided,
                                        display: "none",
                                    }),
                                    menu: (provided, _state) => ({
                                        ...provided,
                                        backgroundColor: "var(--surface-elevated)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        zIndex: 50,
                                    }),
                                    menuList: (provided, _state) => ({
                                        ...provided,
                                        padding: "4px",
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected
                                            ? "var(--primary)"
                                            : state.isFocused
                                              ? "var(--muted)"
                                              : "var(--surface-elevated)",
                                        color: state.isSelected
                                            ? "var(--primary-foreground)"
                                            : "var(--foreground)",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        transition: "all 0.15s ease",
                                        "&:active": {
                                            backgroundColor: "var(--primary)",
                                            color: "var(--primary-foreground)",
                                        },
                                    }),
                                    noOptionsMessage: (provided, _state) => ({
                                        ...provided,
                                        color: "var(--muted-foreground)",
                                        fontSize: "14px",
                                    }),
                                }}
                                theme={theme => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary: "var(--primary)",
                                        primary75: "var(--primary-hover)",
                                        primary50: "var(--primary-light)",
                                        primary25: "var(--primary-light)",
                                        danger: "var(--error)",
                                        dangerLight: "var(--error-light)",
                                        neutral0: "var(--surface)",
                                        neutral5: "var(--surface-elevated)",
                                        neutral10: "var(--border)",
                                        neutral20: "var(--border)",
                                        neutral30: "var(--border-hover)",
                                        neutral40: "var(--muted-foreground)",
                                        neutral50: "var(--muted-foreground)",
                                        neutral60: "var(--muted-foreground)",
                                        neutral70: "var(--foreground)",
                                        neutral80: "var(--foreground)",
                                        neutral90: "var(--foreground)",
                                    },
                                })}
                                aria-invalid={showError}
                                components={{
                                    Control: CustomControl,
                                    Menu: CustomMenu,
                                    Option: CustomOption,
                                }}
                            />
                            {showError && errorMessage && (
                                <p className="text-xs text-error">{errorMessage}</p>
                            )}
                        </>
                    );
                }}
            </Field>
        </div>
    );
}
