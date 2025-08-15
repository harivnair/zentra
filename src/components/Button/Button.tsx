import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, className = '', ...rest }, ref) {
    // Use daisyUI's `btn` as the default base so buttons match the design system.
    return (
        <button
            {...rest}
            ref={ref}
            className={`btn ${className}`}
        >
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
