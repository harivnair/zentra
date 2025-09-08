import { NextResponse } from "next/server"

export async function GET() {
    const upstream = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    try {
        const res = await fetch(`${upstream}/enquiries`)
        const body = await res.text()
        const headers: Record<string, string> = {}
        const contentType = res.headers.get("content-type")
        if (contentType) headers["content-type"] = contentType
        return new NextResponse(body, { status: res.status, headers })
    } catch {
        return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 })
    }
}
