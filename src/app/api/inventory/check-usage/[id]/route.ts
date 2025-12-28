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
        const url = `${BACKEND_URL}/inventory/check-usage/${id}`
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
        console.error('Error fetching inventory usage from', BACKEND_URL, error)
        if (isConnectionRefusedError(error)) {
            return NextResponse.json({ error: 'Backend unreachable (connection refused)', backend: BACKEND_URL }, { status: 502 })
        }
        return NextResponse.json({ error: 'Failed to fetch inventory usage' }, { status: 500 })
    }
}
