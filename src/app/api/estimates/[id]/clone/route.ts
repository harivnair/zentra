import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(
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

        const backendUrl = `${BACKEND_URL}/estimates/${id}/clone`

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: errorText || 'Failed to clone estimate' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Error cloning estimate:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
