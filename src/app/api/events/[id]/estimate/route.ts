import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        const pathname = request.url || ''
        // extract id from url like /api/events/{id}/estimate
        const parts = pathname.split('/')
        const idx = parts.lastIndexOf('events')
        const id = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : ''
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const authToken = request.headers.get('X-Auth-Token')
        const headers: HeadersInit = {}
        if (authToken) headers['Authorization'] = authToken

        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}/estimate`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying /events/{id}/estimate:', err)
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 502 })
    }
}
