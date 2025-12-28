import { NextRequest, NextResponse } from 'next/server'
import { getBackendHeaders, getBackendUrl } from '@/lib/api-server'

const DEFAULT_TIMEOUT = 5000 // ms

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(input, { signal: controller.signal, ...init })
        return res
    } finally {
        clearTimeout(id)
    }
}

function isConnectionRefusedError(err: unknown) {
    if (!err || typeof err !== 'object') return false
    const e = err as { code?: string; cause?: unknown }
    if (e.code === 'ECONNREFUSED') return true
    if (e.cause && typeof e.cause === 'object') {
        const c = e.cause as { code?: string }
        if (c.code === 'ECONNREFUSED') return true
    }
    return false
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const BACKEND_URL = getBackendUrl()
    try {
        const { id } = await params
        const url = `${BACKEND_URL}/inventory/${id}`
        const headers = { ...getBackendHeaders(request), 'Content-Type': 'application/json' }

        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching inventory item from', BACKEND_URL, error)
        if (isConnectionRefusedError(error)) {
            return NextResponse.json({ error: 'Backend unreachable (connection refused)', backend: BACKEND_URL }, { status: 502 })
        }
        return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const BACKEND_URL = getBackendUrl()
    try {
        const { id } = await params
        const body = await request.json()
        const url = `${BACKEND_URL}/inventory/${id}`
        const headers = { ...getBackendHeaders(request), 'Content-Type': 'application/json' }

        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            if (errorData) {
                return NextResponse.json(errorData, { status: response.status })
            }
            throw new Error(`Backend responded with status: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating inventory item in', BACKEND_URL, error)
        if (isConnectionRefusedError(error)) {
            return NextResponse.json({ error: 'Backend unreachable (connection refused)', backend: BACKEND_URL }, { status: 502 })
        }
        return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const BACKEND_URL = getBackendUrl()
    try {
        const { id } = await params
        const url = `${BACKEND_URL}/inventory/${id}`
        const headers = { ...getBackendHeaders(request), 'Content-Type': 'application/json' }

        const response = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`)
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting inventory item in', BACKEND_URL, error)
        if (isConnectionRefusedError(error)) {
            return NextResponse.json({ error: 'Backend unreachable (connection refused)', backend: BACKEND_URL }, { status: 502 })
        }
        return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
    }
}
