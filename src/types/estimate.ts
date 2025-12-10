export type EstimateStatus = "OPEN" | "CLOSED" | "CANCELLED"

// Estimate versioning status
export type EstimateVersionStatus = "DRAFT" | "UNDER_CLIENT_REVIEW" | "FINAL"

export interface EstimateItem {
    id: string
    description: string
    quantity: number
    unitCost: number
    total: number
    specification?: string
    days?: number
    sqft?: number
    rate?: number
    vendor?: string
}

export interface EstimateDto {
    id?: string
    title?: string
    highlvelRequirement: string
    enquiryDate?: string | null
    fromDate?: string | null
    toDate?: string | null
    status?: EstimateStatus
    venue: string
    location?: string
    clientPoC: string
    pocContactNumber: string
    enquiryPoC?: string
    client?: {
        id?: string
        name?: string
    }
    items?: Record<string, EstimateItem[]>
    // Versioning fields
    enquiryId?: string
    version?: string
    estimateStatus?: EstimateVersionStatus
    clonedFromEstimateId?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface EstimateLineItemPayload {
    item: string
    serialNumber: number
    count: number
    pricePerItem: number
    description?: string
    vendor?: string
    checkList?: string
    days?: number
}

export interface CreateEstimatePayload {
    highlvelRequirement: string
    enquiryDate?: string | null
    fromDate?: string | null
    toDate?: string | null
    status: EstimateStatus
    venue: string
    clientPoC: string
    pocContactNumber: string
    enquiryPoC?: string
    client: {
        id: string
    }
    items: Record<string, EstimateLineItemPayload[]>
    enquiryId: string
    location?: string
    title?: string
}
