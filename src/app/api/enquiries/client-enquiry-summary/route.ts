import { NextRequest, NextResponse } from "next/server"
import { getBackendHeaders, getBackendUrl, addContentType } from "@/lib/api-server"

export async function GET(request: NextRequest) {
    const upstream = getBackendUrl()
    try {
        const headers = addContentType(getBackendHeaders(request))
        const res = await fetch(`${upstream}/enquiries/client-enquiry-summary`, { headers })

        const responseBody = await res.text()
        const responseHeaders: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) responseHeaders["content-type"] = contentType

        return new NextResponse(responseBody, { status: res.status, headers: responseHeaders })
    } catch (error) {
        console.error("Error proxying client-enquiry-summary request:", error)
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}
