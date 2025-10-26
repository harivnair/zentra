import CryptoJS from 'crypto-js'

// Use a dynamic key based on user session + environment
const getEncryptionKey = (): string => {
    // In production, use env variable + user-specific salt
    const baseKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'zentra-default-key-change-in-prod'
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    return CryptoJS.SHA256(baseKey + userAgent).toString()
}

/**
 * Encrypt and store data in localStorage
 */
export function setSecureItem(key: string, value: unknown): void {
    try {
        const stringValue = JSON.stringify(value)
        const encrypted = CryptoJS.AES.encrypt(stringValue, getEncryptionKey()).toString()
        localStorage.setItem(key, encrypted)
    } catch (error) {
        console.error('Failed to encrypt and store data:', error)
        throw new Error('Storage encryption failed')
    }
}

/**
 * Retrieve and decrypt data from localStorage
 */
export function getSecureItem<T>(key: string): T | null {
    try {
        const encrypted = localStorage.getItem(key)
        if (!encrypted) return null

        const decrypted = CryptoJS.AES.decrypt(encrypted, getEncryptionKey())
        const stringValue = decrypted.toString(CryptoJS.enc.Utf8)

        if (!stringValue) {
            // Decryption failed - possibly tampered data
            localStorage.removeItem(key)
            return null
        }

        return JSON.parse(stringValue) as T
    } catch (error) {
        console.error('Failed to decrypt data:', error)
        // Remove corrupted data
        localStorage.removeItem(key)
        return null
    }
}

/**
 * Remove item from localStorage
 */
export function removeSecureItem(key: string): void {
    localStorage.removeItem(key)
}

/**
 * Clear all secure storage
 */
export function clearSecureStorage(): void {
    localStorage.clear()
}
