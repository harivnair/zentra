import { NextRequest, NextResponse } from "next/server"
import { getBackendHeaders, getBackendUrl, addContentType } from "@/lib/api-server"

export async function GET(request: NextRequest) {
    const BACKEND_URL = getBackendUrl()
    try {
        const url = new URL(request.url)
        const headers = getBackendHeaders(request)
        const res = await fetch(`${BACKEND_URL}/estimates${url.search}`, { headers })
        const text = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(text, { status: res.status, headers: responseHeaders })
    } catch (error) {
        console.error("Failed to proxy estimates GET:", error)
        return NextResponse.json({ error: "Failed to fetch estimates" }, { status: 502 })
    }
}

export async function POST(request: NextRequest) {
    const BACKEND_URL = getBackendUrl()
    try {
        const body = await request.text()
        const headers = addContentType(getBackendHeaders(request))
        const res = await fetch(`${BACKEND_URL}/estimates`, {
            method: "POST",
            headers,
            body,
        })
        const text = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType
        return new NextResponse(text, { status: res.status, headers: responseHeaders })
    } catch (error) {
        console.error("Failed to proxy estimates POST:", error)
        return NextResponse.json({ error: "Failed to create estimate" }, { status: 502 })
    }
}
