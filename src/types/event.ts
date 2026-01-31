export interface ClientRef {
    id?: string
    name?: string
}

export interface VendorRef {
    id?: string
    name?: string
}

export interface EventItem {
    category?: string
    item?: string
    description?: string
    count?: number
    pricePerItem?: number
    days?: number
    vendor?: VendorRef
    serialNumber?: number
}

export interface AdditionalCost {
    item: string;
    amount: number;
    remarks: string;
}

export interface Event {
    id?: string;
    eventID?: string;
    title: string;
    enquiryDate?: string;
    eventStartDate: string;
    eventEndDate: string;
    location?: string;
    venue?: string;
    discounts?: number;
    status?: string;
    gst?: number;
    tds?: number;
    serviceCharge?: number;
    advanceAmt?: number;
    client: ClientRef;
    address?: string;
    pan?: string;
    items?: EventItem[];
    additionalCostEstimate?: AdditionalCost[];
}

export interface EstimateDropdownItem {
    id: string
    name: string
    version: string
}

export interface EstimateEventDetails {
    id:string
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
    additionalCostEstimate?: AdditionalCost[]
}

export interface CreateEventModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: EventFormData | null
    prefillData?: Partial<EventFormData> | null
    mode?: 'create' | 'edit'
}