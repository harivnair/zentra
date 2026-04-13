export interface Notification {
    id: string;
    user: string;
    action: string;
    detail?: string;
    time: string;
    read: boolean;
    avatar?: string;
}
