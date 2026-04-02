export interface Checklist {
    id: string;
    eventName: string;
    enquiryDate: string;
    clientPoc: string;
    status: "In Progress" | "Not Started" | "Completed" | string;
    gst?: string;
    items?: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
}

export interface ChecklistFormData extends Omit<Checklist, "id"> {
    id?: string | number;
}
