/**
 * Server-side API utility for Next.js API routes
 * This handles forwarding authentication tokens from Next.js API routes to the backend
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Extract the authentication token from the incoming request
 * and prepare headers for forwarding to the backend
 */
export function getBackendHeaders(request: NextRequest | Request): HeadersInit {
    const authToken =
        request.headers.get("X-Auth-Token") ||
        request.headers.get("x-auth-token") ||
        request.headers.get("Authorization") ||
        request.headers.get("authorization");

    const headers: HeadersInit = {};
    if (authToken) {
        headers["Authorization"] = authToken;
        headers["X-Auth-Token"] = authToken;
    }

    return headers;
}

/**
 * Add content-type header if needed
 */
export function addContentType(headers: HeadersInit, contentType: string = "application/json"): HeadersInit {
    if (typeof headers === "object" && !Array.isArray(headers)) {
        return {
            ...headers,
            "Content-Type": contentType,
        };
    }
    return headers;
}

/**
 * Get the backend URL from environment variables
 */
export function getBackendUrl(): string {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
}

/**
 * Utility to handle API requests in Next.js API routes, forwarding to the backend
 */
export async function handleApiRequest(fn: () => Promise<Response>) {
    try {
        const response = await fn();
        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
