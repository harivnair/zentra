import { Role, RoutePermission, Scope } from "../types/auth";

/**
 * Defines the mapping of roles to their respective permissions/scopes.
 * This can be used to determine what actions a user with a specific role is allowed to perform.
 * For example, an 'admin' might have permissions to read and edit users, while a 'user' might only have permissions to read posts.
 */
export const roleScopeMap: Record<Exclude<Role, "super_admin">, Scope[]> = {
    admin: [
        "r:enquiries",
        "w:enquiries",
        "r:estimates",
        "w:estimates",
        "r:events",
        "w:events",
        "r:inventory",
        "w:inventory",
        "r:vendors",
        "w:vendors",
        "r:reports",
        "r:bills",
        "w:bills",
        "r:schedules",
        "w:schedules",
        "r:users",
        "w:users",
    ],
    user: [
        "r:enquiries",
        "w:enquiries",
        "r:estimates",
        "w:estimates",
        "r:events",
        "w:events",
        "r:inventory",
        "w:inventory",
        "r:vendors",
    ],
    customer: ["r:enquiries", "r:estimates", "r:events"],
};

export const routePermissions: Record<string, RoutePermission> = {
    "/dashboard": {
        roles: ["admin", "user", "customer"],
    },
    "/users": {
        roles: ["admin"],
    },
    "/enquiries": {
        roles: ["admin", "user", "customer"],
    },
    "/estimates": {
        roles: ["admin", "user", "customer"],
    },
    "/events": {
        roles: ["admin", "user", "customer"],
    },
    "/events/:id": {
        roles: ["admin", "user", "customer"],
    },
    "/inventory": {
        roles: ["admin", "user"],
    },
    "/vendors": {
        roles: ["admin", "user"],
    },
    "/bills": {
        roles: ["admin"],
    },
    "/schedules": {
        roles: ["admin", "user"],
    },
    "/reports": {
        roles: ["admin"],
    },
    "/expenses": {
        roles: ["admin"],
    },
    "/checklists": {
        roles: ["admin", "user"],
    },
    "/clients": {
        roles: ["admin", "user"],
    },
};
