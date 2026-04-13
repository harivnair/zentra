import { getBackendHeaders, getBackendUrl } from "@/lib/api/api-server";
import { buildQueryUrl } from "@/lib/api/query-params";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const BACKEND_URL = getBackendUrl();
    try {
        const headers = getBackendHeaders(request);
        const searchParams = request.nextUrl.searchParams;

        const url = buildQueryUrl(`${BACKEND_URL}/notifications`, {
            since: searchParams.get("since"),
            uid: searchParams.get("uid"),
        });

        const res = await fetch(url, {
            method: "GET",
            headers,
        });
        const data = await res.text();
        const contentType = res.headers.get("content-type");
        return new NextResponse(data, {
            status: res.status,
            headers: contentType ? { "content-type": contentType } : undefined,
        });
    } catch (error) {
        console.error("[Users API] Error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 502 });
    }
}
