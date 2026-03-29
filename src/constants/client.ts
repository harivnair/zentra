import { ClientFormData } from "@/types/client";

export const clientFormInitialValues: ClientFormData = {
    name: "",
    email: "",
    phone: "",
    address: "",
    poc: "",
    gst: "",
    pan: "",
    gstCertificate: "",
};

export const clientSortOptions = [
    { label: "Created At", value: "createdAt" },
    { label: "Updated At", value: "updatedAt" },
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
];
