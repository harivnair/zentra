import { NextResponse } from "next/server"

export async function GET() {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const res = await fetch(`${upstream}/events`)
        const body = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers })
    } catch (err) {
        console.error('Error proxying /events:', err)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

export async function POST(request: Request) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const body = await request.text()
        const res = await fetch(`${upstream}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        })
        const responseBody = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType
        return new NextResponse(responseBody, { status: res.status, headers })
    } catch (err) {
        console.error('Error proxying POST /events:', err)
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 502 })
    }
}
