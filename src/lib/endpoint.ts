// Centralized API endpoint definitions for Zentra

export const API_ENDPOINTS = {
    enquiries: {
        list: '/api/enquiries',
        detail: (id: string | number) => `/api/enquiries/${id}`,
        clientSummary: '/api/enquiries/client-enquiry-summary',
    },
    events: {
        list: '/api/events',
        detail: (id: string | number) => `/api/events/${id}`,
    },
    clients: {
        list: '/api/clients',
    },
    inventory: {
        list: '/api/inventory',
        detail: (id: string | number) => `/api/inventory/${id}`,
        checkUsage: (id: string | number) => `/api/inventory/check-usage/${id}`,
    },
    estimates: {
        list: '/api/estimates',
        detail: (id: string | number) => `/api/estimates/${id}`,
    },
    auth: {
        login: '/api/login',
    },
    // Add other endpoints as needed
}
