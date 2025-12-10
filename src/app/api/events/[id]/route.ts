import { NextRequest, NextResponse } from "next/server"
import { getBackendUrl, getBackendHeaders } from "@/lib/api-server"

export async function GET(request: NextRequest) {
    const upstream = getBackendUrl()
    try {
        const pathname = request.nextUrl?.pathname ?? ""
        const parts = pathname.split("/")
        const id = parts[parts.length - 1]
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const headers = getBackendHeaders(request)
        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying GET /events/:id:', err)
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 502 })
    }
}

export async function DELETE(request: NextRequest) {
    const upstream = getBackendUrl()
    try {
        const pathname = request.nextUrl?.pathname ?? ""
        const parts = pathname.split("/")
        const id = parts[parts.length - 1]
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const headers = getBackendHeaders(request)

        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}`, { method: 'DELETE', headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get('content-type')
        if (contentType) responseHeaders['content-type'] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying DELETE /events/:id', err)
        return NextResponse.json({ error: 'Failed to proxy delete' }, { status: 502 })
    }
}

export async function PUT(request: NextRequest) {
    const upstream = getBackendUrl()
    try {
        const pathname = request.nextUrl?.pathname ?? ""
        const parts = pathname.split("/")
        const id = parts[parts.length - 1]
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const body = await request.text()
        const headers = { ...getBackendHeaders(request), 'Content-Type': 'application/json' } as HeadersInit

        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers,
            body
        })

        const responseBody = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get('content-type')
        if (contentType) responseHeaders['content-type'] = contentType
        return new NextResponse(responseBody, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying PUT /events/:id', err)
        return NextResponse.json({ error: 'Failed to proxy update' }, { status: 502 })
    }
}
