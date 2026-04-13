import { User, UsersTableFiltersFormValues } from "@/types/user";

export const userFormInitialValues: User = {
    id: "",
    name: "",
    role: "",
    phone: "",
    email: "",
    uid: "",
    password: "",
};

export const userRoleOptions = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Customer", value: "customer" },
];

export const userSortOptions = [
    { label: "Created At", value: "createdAt" },
    { label: "Updated At", value: "updatedAt" },
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Username", value: "username" },
];

export const userFiltersInitialValues: UsersTableFiltersFormValues = {
    search: "",
    role: "",
    sortBy: "createdAt",
    sortOrder: "desc",
};
