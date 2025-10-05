export interface EnquiryFormData {
    id?: string | number // Optional for create, required for edit
    status?: string // Enum: OPEN, CLOSED, etc.
    highlvelRequirement: string
    enquiryDate?: string
    fromDate: string
    toDate: string
    venue: string
    eventName?: string
    location?: string
    clientType?: 'corporate' | 'individual' // deprecated in favor of eventType
    clientPoC: string
    enquiryPoCNumber: string
    eventPoCNumber?: string
    eventPoC?: string
    client: string // Client ID
    clientName?: string // For new client creation upon submit
    eventType?: 'CORPORATE' | 'INDIVIDUAL'
}

export interface CreateEnquiryModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: EnquiryFormData | null // Optional edit data
    mode?: 'create' | 'edit' // Modal mode
}
