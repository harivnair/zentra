export type NotificationType =
    | "ENQUIRY"
    | "EVENT"
    | "USER"
    | "SYSTEM"
    | "INVENTORY"
    | "ESTIMATE"
    | "VENDOR"
    | "CHECKLIST";

export interface NotificationData {
    type: NotificationType;
    entityId: string | null;
    message: string;
    data: Record<string, unknown>;
    createdAt: string;
    isRead?: boolean;
}
