
import React, { useId } from 'react'

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(function FormInput({ label, id, ...rest }, ref) {
    const autoId = useId()
    const inputId = id ?? `input-${autoId}`

    return (
        <label className="block mb-4" htmlFor={inputId}>
            {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
            <input
                {...rest}
                id={inputId}
                ref={ref}
                className="input input-bordered w-full"
            />
        </label>
    )
})

FormInput.displayName = 'FormInput'

export default FormInput
