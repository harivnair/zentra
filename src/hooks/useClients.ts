"use client"

import { useState, useEffect } from 'react'
import { Client } from '@/types/client'

export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchClients = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/clients')

            if (!response.ok) {
                throw new Error(`Failed to fetch clients: ${response.statusText}`)
            }

            const data = await response.json()
            setClients(data)
        } catch (err) {
            console.error('Error fetching clients:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch clients')
            setClients([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    return { clients, loading, error, refresh: fetchClients }
}
