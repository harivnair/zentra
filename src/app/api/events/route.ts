import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        const headers: HeadersInit = {}
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/events`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying /events:', err)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

export async function POST(request: Request) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        const body = await request.text()
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/events`, {
            method: 'POST',
            headers,
            body
        })
        const responseBody = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(responseBody, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying POST /events:', err)
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 502 })
    }
}
