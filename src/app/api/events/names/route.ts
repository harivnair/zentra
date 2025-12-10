import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header (passed as X-Auth-Token by client helper)
        const authToken = request.headers.get('X-Auth-Token')

        const headers: HeadersInit = {}
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/events/names`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying /events/names:', err)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}
