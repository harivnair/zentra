/**
 * Build a URL with query parameters from a base URL and params object
 * @param baseUrl - The base URL (e.g., "/api/users")
 * @param params - Object containing query parameters
 * @returns URL string with query parameters
 *
 * @example
 * buildQueryUrl("/api/users", { page: "0", size: "10" })
 * // returns "/api/users?page=0&size=10"
 *
 * @example
 * buildQueryUrl("/api/users", { page: "0", search: "john", role: "admin" })
 * // returns "/api/users?page=0&search=john&role=admin"
 */
export function buildQueryUrl(
    baseUrl: string,
    params: Record<string, string | number | boolean | undefined | null>,
): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
