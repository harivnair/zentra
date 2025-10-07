"use client"

import { API_ENDPOINTS } from "../lib/endpoint"

import React, { createContext, useContext, useEffect, useState } from "react"

type Enquiry = {
    id: number | string
    client: string
    date: string
    poc: string
    status: string
    assignee: string
    [k: string]: unknown
}

type EnquiriesContextShape = {
    enquiries: Enquiry[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const EnquiriesContext = createContext<EnquiriesContextShape | undefined>(undefined)

export function EnquiriesProvider({ children }: { children: React.ReactNode }) {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)


    async function fetchEnquiries() {
        setLoading(true)
        setError(null)
        try {
            // Always use Next.js API route to avoid CORS issues
            const res = await fetch(`${API_ENDPOINTS.enquiries.list}?page=0&size=10`)
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
            const data = await res.json()

            // Helper: find the first array in the response object (accept many shapes)
            function findArray(obj: unknown): unknown[] | null {
                if (Array.isArray(obj)) return obj
                if (obj && typeof obj === "object") {
                    const o = obj as Record<string, unknown>
                    if (Array.isArray(o.enquiries)) return o.enquiries as unknown[]
                    if (Array.isArray(o.data)) return o.data as unknown[]
                    if (Array.isArray(o.items)) return o.items as unknown[]
                    for (const v of Object.values(o)) {
                        if (Array.isArray(v)) return v as unknown[]
                    }
                }
                return null
            }

            const rawList = findArray(data) ?? []

            // Normalize common backend field names to the UI shape
            const list = (rawList as unknown[]).map((item) => {
                const it = item as Record<string, unknown>
                const get = (keys: string[]) => {
                    for (const k of keys) {
                        if (k in it && it[k] !== undefined) return it[k]
                    }
                    return undefined
                }

                const idVal = get(["id", "_id", "enquiryId", "id_enquiry"]) ?? JSON.stringify(it)
                const clientRaw = get(["client", "clientName", "name", "customer", "customer_name"])
                const dateRaw = get(["date", "enquiryDate", "createdAt", "created_date", "dateCreated"])
                // prefer explicit client POC fields; also accept nested client.poc
                const pocRaw = get(["clientPoC", "enquiryPoC", "poc", "clientPoc", "pointOfContact", "pocName"])
                const statusRaw = get(["status", "state", "enquiryStatus", "statusText"])
                const assigneeRaw = get(["assignee", "assignedTo", "owner", "responsible"])

                const clientVal = typeof clientRaw === "string" ? clientRaw : undefined
                const dateVal = typeof dateRaw === "string" ? dateRaw : undefined
                const pocVal = typeof pocRaw === "string" ? pocRaw : undefined
                const statusVal = typeof statusRaw === "string" ? statusRaw : undefined
                const assigneeVal = typeof assigneeRaw === "string" ? assigneeRaw : undefined

                // If client is an object with a name field, use that as client name
                let clientNameFromObj: string | undefined = undefined
                if (it.client && typeof it.client === "object") {
                    const c = it.client as Record<string, unknown>
                    if (c && "name" in c && typeof c.name === "string") clientNameFromObj = c.name
                }

                return {
                    // spread raw item first, then override with normalized primitives
                    ...it,
                    id: idVal as string | number,
                    client: clientVal ?? clientNameFromObj ?? "",
                    date: dateVal ?? "",
                    poc: pocVal ?? "",
                    status: statusVal ?? "Not Started",
                    assignee: assigneeVal ?? "Unassigned",
                }
            })

            // normalized list prepared
            setEnquiries(list)
        } catch (err: unknown) {
            let msg = String(err)
            if (err && typeof err === "object" && "message" in err) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - narrow to read message property
                msg = (err as { message?: unknown }).message as string
            }
            setError(msg ?? "Failed to fetch enquiries")
            setEnquiries([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEnquiries()
         
    }, [])

    return (
        <EnquiriesContext.Provider value={{ enquiries, loading, error, refresh: fetchEnquiries }}>
            {children}
        </EnquiriesContext.Provider>
    )
}

export function useEnquiries() {
    const ctx = useContext(EnquiriesContext)
    if (!ctx) throw new Error("useEnquiries must be used inside EnquiriesProvider")
    return ctx
}
