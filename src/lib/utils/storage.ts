/**
 * Safe localStorage wrapper with error handling
 */

export function getLocalStorageItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Failed to get localStorage item "${key}":`, error);
        return null;
    }
}

export function setLocalStorageItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Failed to set localStorage item "${key}":`, error);
    }
}

export function removeLocalStorageItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove localStorage item "${key}":`, error);
    }
}

export function clearLocalStorage(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.clear();
    } catch (error) {
        console.error("Failed to clear localStorage:", error);
    }
}
