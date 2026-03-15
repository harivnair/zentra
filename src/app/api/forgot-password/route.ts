import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    try {
        const body = await request.json()
        const { action } = body

        let endpoint = ""

        if (action === "request-reset") {
            endpoint = "/users/forgot-password/request"
        } else if (action === "verify-otp") {
            endpoint = "/users/forgot-password/verify-otp"
        } else if (action === "reset-password") {
            endpoint = "/users/forgot-password/reset"
        } else {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            )
        }

        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await response.text()

        const responseHeaders: Record<string, string> = {}
        const contentType = response.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error) {
        console.error("Forgot password proxy error:", error)
        return NextResponse.json(
            { error: "Failed to connect to authentication service" },
            { status: 502 }
        )
    }
}
