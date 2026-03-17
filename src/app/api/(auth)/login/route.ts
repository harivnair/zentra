import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    try {
        const body = await request.json()

        const response = await fetch(`${backendUrl}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.text()

        const responseHeaders: Record<string, string> = {}
        const contentType = response.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType

        return new NextResponse(data, {
            status: response.status,
            headers: responseHeaders
        })
    } catch (error) {
        console.error('Login proxy error:', error)
        return NextResponse.json(
            { error: "Failed to connect to authentication service" },
            { status: 502 }
        )
    }
}
