export interface Inventory {
    id?: string
    itemName: string
    category: string
    spec: string
    dimensions: string
    quantity: number
    price: number
}

export interface InventoryFormData {
    id?: string
    itemName: string
    category: string
    spec: string
    dimensions: string
    quantity: number | string
    price: number | string
}

export interface InventoryUsage {
    id?: string
    inventoryId?: string
    // Add other fields as needed based on backend model
    [key: string]: any
}

export interface CreateInventoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: InventoryFormData | null
    mode?: 'create' | 'edit'
}
