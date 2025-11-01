"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"

export interface EventPrefillData {
    estimateId?: string
    enquiryId?: string
    title?: string
    clientId?: string
    clientName?: string
    location?: string
    venue?: string
    eventStartDate?: string
    eventEndDate?: string
    highlvelRequirement?: string
}

export type EventPrefillPayload = EventPrefillData | null

type EventPrefillContextShape = {
    prefill: EventPrefillPayload
    setPrefill: (value: EventPrefillPayload) => void
    clearPrefill: () => void
}

const EventPrefillContext = createContext<EventPrefillContextShape | undefined>(undefined)

export function EventPrefillProvider({ children }: { children: React.ReactNode }) {
    const [prefill, setPrefillState] = useState<EventPrefillPayload>(null)

    const clearPrefill = useCallback(() => setPrefillState(null), [])

    const value = useMemo(() => ({
        prefill,
        setPrefill: setPrefillState,
        clearPrefill,
    }), [prefill, clearPrefill])

    return (
        <EventPrefillContext.Provider value={value}>
            {children}
        </EventPrefillContext.Provider>
    )
}

export function useEventPrefill() {
    const ctx = useContext(EventPrefillContext)
    if (!ctx) {
        throw new Error("useEventPrefill must be used within an EventPrefillProvider")
    }
    return ctx
}
