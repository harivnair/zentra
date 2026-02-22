import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        const authToken = request.headers.get('X-Auth-Token')
        const body = await request.text()
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/events/clone`, {
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
        console.error('Error proxying POST /events/clone:', err)
        return NextResponse.json({ error: 'Failed to proxy clone request' }, { status: 502 })
    }
}
