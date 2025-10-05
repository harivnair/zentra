export interface ClientRef {
    id?: string
    name?: string
}

export interface EventFormData {
    id?: string
    title: string
    date: string
    location?: string
    status?: string
    clientId?: string
}

export interface CreateEventModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
    editData?: EventFormData | null
    mode?: 'create' | 'edit'
}
