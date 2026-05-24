// Centralized API endpoint definitions for Zentra

export const API_ENDPOINTS = {
    enquiries: {
        list: "/api/enquiries",
        detail: (id: string | number) => `/api/enquiries/${id}`,
        clientSummary: "/api/enquiries/client-enquiry-summary",
    },
    events: {
        list: "/api/events",
        // Event detail now queried via /by-eventid?eventID=<id>
        detail: (id: string | number) => `/api/events/by-eventid?eventID=${id}`,
        update: (id: string | number) => `/api/events/${id}`,
        versions: (eventID: string | number) => `/api/events/versions?eventID=${eventID}`,
        updateStatus: (eventID: string | number, versionID: string | number, status: string) =>
            `/api/events/updateStatus?eventID=${eventID}&versionID=${versionID}&status=${status}`,
        sendInvoice: "/api/events/send-invoice",
        clone: "/api/events/clone",
    },
    clients: {
        list: "/api/clients",
        detail: (id: string | number) => `/api/clients/${id}`,
    },
    checklists: {
        list: "/api/checklists",
        detail: (id: string | number) => `/api/checklists/${id}`,
    },
    inventory: {
        list: "/api/inventory",
        detail: (id: string | number) => `/api/inventory/${id}`,
        checkUsage: (id: string | number) => `/api/inventory/check-usage/${id}`,
        dropdown: "/api/inventory",
    },
    vendors: {
        list: "/api/vendors",
    },
    estimates: {
        list: "/api/estimates",
        detail: (id: string | number) => `/api/estimates/${id}`,
        byEnquiry: (id: string | number) => `/api/estimates/by-enquiry/${id}`,
    },
    auth: {
        login: "/api/login",
        forgotPassword: "/api/forgot-password",
    },
    notifications: {
        list: "/api/notifications",
    },
    users: "/api/users",
    // Add other endpoints as needed
};

// Backend Endpoints - to be used by Next.js API routes to communicate with Spring Boot
export const BACKEND_ENDPOINTS = {
    events: {
        sendInvoice: "/events/send-invoice",
    },
};
