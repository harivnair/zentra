export interface VendorItem {
    id?: string
    name: string
    description?: string
    rate?: number
    unit?: string
}

export interface Vendor {
    id?: string
    name: string
    billingAddress: string
    gst: number
    tds: number
    gstCertificate?: string
    phone: string
    items?: VendorItem[]
}

export interface VendorFormData {
    id?: string
    name: string
    billingAddress: string
    gst: number | string
    tds: number | string
    gstCertificate: string
    phone: string
    items?: VendorItem[]
}

export interface CreateVendorModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: VendorFormData | null
    mode?: 'create' | 'edit'
}
