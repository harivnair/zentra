"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import { EstimateDto } from "@/types/estimate"

export type EstimatePrefillPayload = (Partial<EstimateDto> & { enquiryId?: string }) | null

type EstimatePrefillContextShape = {
    prefill: EstimatePrefillPayload
    setPrefill: (value: EstimatePrefillPayload) => void
    clearPrefill: () => void
}

const EstimatePrefillContext = createContext<EstimatePrefillContextShape | undefined>(undefined)

export function EstimatePrefillProvider({ children }: { children: React.ReactNode }) {
    const [prefill, setPrefillState] = useState<EstimatePrefillPayload>(null)

    const clearPrefill = useCallback(() => setPrefillState(null), [])

    const value = useMemo(() => ({
        prefill,
        setPrefill: setPrefillState,
        clearPrefill,
    }), [prefill, clearPrefill])

    return (
        <EstimatePrefillContext.Provider value={value}>
            {children}
        </EstimatePrefillContext.Provider>
    )
}

export function useEstimatePrefill() {
    const ctx = useContext(EstimatePrefillContext)
    if (!ctx) {
        throw new Error("useEstimatePrefill must be used within an EstimatePrefillProvider")
    }
    return ctx
}
