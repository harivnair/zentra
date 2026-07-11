import { BACKEND_URL } from "@/lib/api/backend-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        console.log("Received send-email request via Next.js API Route");

        // Parse incoming request as FormData
        const formData = await req.formData();

        // Extract headers
        const authHeader = req.headers.get("Authorization") || req.headers.get("X-Auth-Token");

        console.log("Auth Header present:", !!authHeader);

        // Forward to Spring Boot backend - Use 127.0.0.1 (not localhost) for consistency
        const url = `${BACKEND_URL}/notifications/send-email`;
        // When sending FormData with fetch, do NOT manually set Content-Type.
        // The browser/fetch automatically sets it with the correct boundary.
        const response = await fetch(url, {
            method: "POST",
            body: formData, // passing FormData directly lets fetch set the content-type with boundary
            headers: authHeader ? { Authorization: authHeader } : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend failed with status ${response.status}: ${errorText}`);
            return new NextResponse(errorText, { status: response.status });
        }

        const result = await response.text();
        console.log("Backend success:", result);
        return new NextResponse(result, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("API Route Proxy Error:", error);
        return new NextResponse(`Internal Server Error: ${message}`, { status: 500 });
    }
}
