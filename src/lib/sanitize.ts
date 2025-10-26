import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target']
    })
}

/**
 * Sanitize plain text input (remove all HTML)
 */
export function sanitizeText(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const sanitized = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
        throw new Error('Invalid email format')
    }
    return sanitized
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
    const sanitized = phone.replace(/[^\d+\-().\s]/g, '')
    if (sanitized.length < 10) {
        throw new Error('Invalid phone number')
    }
    return sanitized
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj }

    for (const key in result) {
        const value = result[key]

        if (typeof value === 'string') {
            result[key] = sanitizeText(value) as T[Extract<keyof T, string>]
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>]
        } else if (Array.isArray(value)) {
            result[key] = value.map((item: unknown) =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : item
            ) as T[Extract<keyof T, string>]
        }
    }

    return result
}
