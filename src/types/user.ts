export interface User {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    uid: string;
    password?: string;
}

export interface UsersTableFiltersFormValues {
    search: string;
    role: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
}
