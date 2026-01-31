import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        // Get eventID from query params
        const searchParams = request.nextUrl.searchParams
        const eventID = searchParams.get('eventID')

        if (!eventID) {
            return NextResponse.json({ error: "eventID is required" }, { status: 400 })
        }

        const headers: HeadersInit = {}
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(`${upstream}/events/versions?eventID=${encodeURIComponent(eventID)}`, { headers })
        const body = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying /events/versions:', err)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}
