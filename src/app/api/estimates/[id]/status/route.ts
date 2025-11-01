import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const authToken = request.headers.get('X-Auth-Token')

        if (!authToken) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get status from query params
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        if (!status) {
            return NextResponse.json(
                { error: 'Status parameter is required' },
                { status: 400 }
            )
        }

        // Validate status value
        const validStatuses = ['DRAFT', 'UNDER_CLIENT_REVIEW', 'FINAL']
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value. Must be DRAFT, UNDER_CLIENT_REVIEW, or FINAL' },
                { status: 400 }
            )
        }

        const backendUrl = `${BACKEND_URL}/estimates/${id}/status?status=${status}`

        const response = await fetch(backendUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: errorText || 'Failed to update estimate status' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating estimate status:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
