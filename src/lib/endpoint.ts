// Centralized API endpoint definitions for Zentra

export const API_ENDPOINTS = {
    enquiries: {
        list: '/api/enquiries',
        detail: (id: string | number) => `/api/enquiries/${id}`,
    },
    events: {
        list: '/api/events',
        detail: (id: string | number) => `/api/events/${id}`,
    },
    clients: {
        list: '/api/clients',
    },
    // Add other endpoints as needed
}
