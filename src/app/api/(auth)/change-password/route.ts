import { NextRequest } from "next/server";
import { handleApiRequest, getBackendUrl, getBackendHeaders } from "@/lib/api/api-server";

export async function PUT(request: NextRequest) {
    return handleApiRequest(async () => {
        const backendUrl = getBackendUrl();
        const body = await request.json();
        const response = await fetch(`${backendUrl}/users/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getBackendHeaders(request),
            },
            body: JSON.stringify(body),
        });

        return response;
    });
}
