/**
 * Server-side API utility for Next.js API routes
 * This handles forwarding authentication tokens from Next.js API routes to the backend
 */

import { NextRequest } from 'next/server'

/**
 * Extract the authentication token from the incoming request
 * and prepare headers for forwarding to the backend
 */
export function getBackendHeaders(request: NextRequest | Request): HeadersInit {
    // Try different case variations of the header
    let authToken = request.headers.get('X-Auth-Token')
    if (!authToken) {
        authToken = request.headers.get('x-auth-token')
    }

    const headers: HeadersInit = {}
    if (authToken) {
        headers['Authorization'] = authToken
    }

    return headers
}

/**
 * Add content-type header if needed
 */
export function addContentType(headers: HeadersInit, contentType: string = 'application/json'): HeadersInit {
    if (typeof headers === 'object' && !Array.isArray(headers)) {
        return {
            ...headers,
            'Content-Type': contentType
        }
    }
    return headers
}

/**
 * Get the backend URL from environment variables
 */
export function getBackendUrl(): string {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
}
