import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get auth token from request headers
        const authToken = request.headers.get('x-auth-token') || request.headers.get('X-Auth-Token');

        if (!authToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        const backendUrl = `${BACKEND_URL}/estimates/${id}/event`;

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching event details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event details', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
