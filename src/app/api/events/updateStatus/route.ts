import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const upstream = process.env.BACKEND_URL || "http://localhost:8080"
    try {
        // Extract auth token from request header
        const authToken = request.headers.get('X-Auth-Token')

        // Extract query parameters
        const searchParams = request.nextUrl.searchParams
        const eventID = searchParams.get('eventID')
        const versionID = searchParams.get('versionID')
        const status = searchParams.get('status')

        // Validate required parameters
        if (!eventID || !versionID || !status) {
            return NextResponse.json(
                { error: 'Missing required parameters: eventID, versionID, status' },
                { status: 400 }
            )
        }

        // Build the upstream URL with query parameters
        const upstreamUrl = `${upstream}/events/updateStatus?eventID=${encodeURIComponent(eventID)}&versionID=${encodeURIComponent(versionID)}&status=${encodeURIComponent(status)}`

        const headers: HeadersInit = {}
        if (authToken) {
            headers['Authorization'] = authToken
        }

        const res = await fetch(upstreamUrl, {
            method: 'POST',
            headers
        })

        const responseBody = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType

        return new NextResponse(responseBody, { status: res.status, headers: responseHeaders })
    } catch (err) {
        console.error('Error proxying POST /events/updateStatus:', err)
        return NextResponse.json({ error: 'Failed to proxy request' }, { status: 502 })
    }
}
