export type EstimateStatus =
    | "CHECKLIST_COMPLETED"
    | "PROJECT_POSTONED"
    | "PROJECT_COMPLETED"
    | "ESTIMATE_UNDER_REVIEW"
    | "PROJECT_SETTLEMENT_IN_PROGRESS"
    | "PROJECT_INPROGRESS"
    | "ESTIMATE_INPROGRESS"
    | "ENQUIRY_CREATED"
    | "ESTIMATE_APPROVED"
    | "OPEN"
    | "CLOSED"
    | "CANCELLED";

// Estimate versioning status
export type EstimateVersionStatus = "DRAFT" | "UNDER_CLIENT_REVIEW" | "FINAL";

export interface EstimateItem {
    id: string;
    description: string;
    quantity: number;
    unitCost: number;
    total: number;
    specification?: string;
    days?: number;
    sqft?: number;
    rate?: number;
    vendor?: string;
    pricePerItem?: number;
    finalAmt?: number;
    item?: string;
}

export interface EstimateDto {
    id?: string;
    title?: string;
    highlvelRequirement: string;
    enquiryDate?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    status?: EstimateStatus;
    venue: string;
    location?: string;
    clientPoC: string;
    pocContactNumber: string;
    enquiryPoC?: string;
    client?: string;
    items?: Record<string, EstimateItem[]>;
    // Versioning fields
    enquiryId?: string;
    version?: string;
    estimateStatus?: EstimateVersionStatus;
    clonedFromEstimateId?: string | null;
    createdAt?: string;
    updatedAt?: string;
    eventName?: string;
    eventID?: string;
}

export interface EstimateLineItemPayload {
    item: string;
    serialNumber: number;
    quantity: number;
    pricePerItem: number;
    description?: string;
    vendor?: string;
    checkList?: string;
    days?: number;
    finalAmt: number;
}

export interface CreateEstimatePayload {
    highlvelRequirement: string;
    enquiryDate?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    status: EstimateStatus;
    venue: string;
    clientPoC: string;
    pocContactNumber: string;
    enquiryPoC?: string;
    client: string;
    items: Record<string, EstimateLineItemPayload[]>;
    enquiryId: string;
    location?: string;
    title?: string;
    eventName?: string;
    eventID?: string;
}
