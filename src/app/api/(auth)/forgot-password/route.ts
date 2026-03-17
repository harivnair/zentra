import { NextRequest } from "next/server";
import { handleApiRequest, getBackendUrl, getBackendHeaders } from "@/lib/api-server";

export async function POST(request: NextRequest) {
    return handleApiRequest(async () => {
        const backendUrl = getBackendUrl();
        const body = await request.json();

        console.log({ body }, "forgot-password request body");

        const response = await fetch(`${backendUrl}/users/generate-otp?email=${body.email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getBackendHeaders(request),
            },
        });

        return response;
    });
}
