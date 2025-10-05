import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        // request.nextUrl.pathname is like /api/enquiries/{id}
        const pathname = request.nextUrl?.pathname ?? ''
        const parts = pathname.split('/')
        const id = parts[parts.length - 1]
        if (!id) {
            return NextResponse.json({ error: 'Missing enquiry id' }, { status: 400 })
        }

        const res = await fetch(`${upstream}/enquiries/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        })

        const responseBody = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType

        return new NextResponse(responseBody, { status: res.status, headers })
    } catch (error) {
        console.error('Error proxying DELETE request:', error)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}
