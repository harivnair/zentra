import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page') ?? '0'
        const size = searchParams.get('size') ?? '10'
        const status = searchParams.get('status')
        const name = searchParams.get('name')

        let query = `?page=${page}&size=${size}`
        if (status) query += `&status=${encodeURIComponent(status)}`
        if (name) query += `&name=${encodeURIComponent(name)}`

        const res = await fetch(`${upstream}/enquiries${query}`)
        const body = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers })
    } catch {
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

export async function POST(request: NextRequest) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const body = await request.json()

        const res = await fetch(`${upstream}/enquiries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        const responseBody = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType

        return new NextResponse(responseBody, { status: res.status, headers })
    } catch (error) {
        console.error('Error proxying POST request:', error)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

