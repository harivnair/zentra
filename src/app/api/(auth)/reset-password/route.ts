import { NextRequest } from "next/server";
import { handleApiRequest, getBackendUrl, getBackendHeaders } from "@/lib/api/api-server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("[reset-password] Received body:", body); // confirm body arrived

    return handleApiRequest(async () => {
        const backendUrl = getBackendUrl();
        const backendHeaders = getBackendHeaders(request);
        console.log("[reset-password] Backend headers:", backendHeaders); // check for Content-Type conflicts
        console.log("[reset-password] Forwarding to:", `${backendUrl}/users/reset-password`);

        const response = await fetch(`${backendUrl}/users/reset-password`, {
            method: "POST",
            headers: {
                ...backendHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("[reset-password] Backend response status:", response.status);
        return response;
    });
}
