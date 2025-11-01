export interface ClientRef {
    id?: string
    name?: string
}

export interface EstimateDropdownItem {
    id: string
    name: string
    version: string
}

export interface EstimateEventDetails {
    id: string
    enquiryId: string
    title: string
    eventName?: string
    fromDate: string
    toDate: string
    location?: string
    venue?: string
    status?: string
    client?: string | {
        id?: string
        name: string
        phone: string
    }
    vendor?: unknown[]
    items?: unknown[]
}

export interface EventFormData {
    id?: string
    title: string
    eventName?: string  // For backward compatibility with backend responses
    enquiryDate?: string
    eventStartDate: string
    eventEndDate: string
    location?: string
    venue?: string
    status?: string
    clientId?: string
    estimateId?: string
    enquiryId?: string
}

export interface CreateEventModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: EventFormData | null
    prefillData?: Partial<EventFormData> | null
    mode?: 'create' | 'edit'
}
