import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page') ?? '0'
        const size = searchParams.get('size') ?? '10'
        const status = searchParams.get('status')
        const name = searchParams.get('name')
        const clientName = searchParams.get('clientName')
        const enquiryTitle = searchParams.get('enquiryTitle') ?? searchParams.get('title')

        let query = `?page=${page}&size=${size}`
        if (status) query += `&status=${encodeURIComponent(status)}`
        if (name) query += `&name=${encodeURIComponent(name)}`
        if (clientName) query += `&clientName=${encodeURIComponent(clientName)}`
        if (enquiryTitle) query += `&enquiryTitle=${encodeURIComponent(enquiryTitle)}`

        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        const headers: HeadersInit = {}
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/enquiries${query}`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch {
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

export async function POST(request: NextRequest) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        const body = await request.json()

        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/enquiries`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })

        const responseBody = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType

        return new NextResponse(responseBody, { status: res.status, headers: responseHeaders })
    } catch (error) {
        console.error('Error proxying POST request:', error)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}

