import { NextRequest, NextResponse } from "next/server";
import { getBackendHeaders, getBackendUrl } from "@/lib/api-server";

export async function GET(request: NextRequest) {
    const BACKEND_URL = getBackendUrl();
    try {
        const headers = getBackendHeaders(request);
        const res = await fetch(`${BACKEND_URL}/users`, {
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
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 502 });
    }
}

export async function POST(request: NextRequest) {
    const BACKEND_URL = getBackendUrl();
    try {
        const headers = getBackendHeaders(request);
        const body = await request.text();
        const res = await fetch(`${BACKEND_URL}/users`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body,
        });
        const data = await res.text();
        const contentType = res.headers.get("content-type");
        return new NextResponse(data, {
            status: res.status,
            headers: contentType ? { "content-type": contentType } : undefined,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 502 });
    }
}

export async function PUT(request: NextRequest) {
    const BACKEND_URL = getBackendUrl();
    try {
        const headers = getBackendHeaders(request);
        const url = new URL(request.url);
        const id = url.pathname.split("/").pop();
        const body = await request.text();
        const res = await fetch(`${BACKEND_URL}/users/${id}`, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body,
        });
        const data = await res.text();
        const contentType = res.headers.get("content-type");
        return new NextResponse(data, {
            status: res.status,
            headers: contentType ? { "content-type": contentType } : undefined,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 502 });
    }
}
