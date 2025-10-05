import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const pathname = request.nextUrl?.pathname ?? ''
        const parts = pathname.split('/')
        const id = parts[parts.length - 1]
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}`, { method: 'DELETE' })
        const body = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get('content-type')
        if (contentType) headers['content-type'] = contentType
        return new NextResponse(body, { status: res.status, headers })
    } catch (err) {
        console.error('Error proxying DELETE /events/:id', err)
        return NextResponse.json({ error: 'Failed to proxy delete' }, { status: 502 })
    }
}

export async function PUT(request: NextRequest) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const pathname = request.nextUrl?.pathname ?? ''
        const parts = pathname.split('/')
        const id = parts[parts.length - 1]
        if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

        const body = await request.text()
        const res = await fetch(`${upstream}/events/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body
        })

        const responseBody = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get('content-type')
        if (contentType) headers['content-type'] = contentType
        return new NextResponse(responseBody, { status: res.status, headers })
    } catch (err) {
        console.error('Error proxying PUT /events/:id', err)
        return NextResponse.json({ error: 'Failed to proxy update' }, { status: 502 })
    }
}
