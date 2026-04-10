import { routePermissions, roleScopeMap } from "@/config/permissions";
import { User } from "@/context/auth";
import { RoutePermission, Role, Scope } from "@/types/auth";
import { NavSection } from "@/config/nav";
import { MenuItem } from "@/types";

/**
 * Converts a route pattern like /events/:id into a regex
 * Supports :param and * (wildcard) segments
 */
function patternToRegex(pattern: string): RegExp {
    const escaped = pattern
        .replace(/\//g, "\\/") // escape slashes
        .replace(/:[^/]+/g, "[^/]+") // :param → match any segment
        .replace(/\*/g, ".*"); // * → match anything
    return new RegExp(`^${escaped}$`);
}

/**
 * Finds the most specific matching route permission for a given pathname.
 * More specific (longer) patterns take priority over shorter ones.
 */
export function matchRoutePermission(pathname: string): RoutePermission | undefined {
    const matches = Object.entries(routePermissions)
        .filter(([pattern]) => patternToRegex(pattern).test(pathname))
        .sort((a, b) => b[0].length - a[0].length); // longest pattern wins

    return matches[0]?.[1];
}

/**
 * Checks if a user has permission based on roles and scopes.
 * Super admin has access to all scopes by default.
 *
 * @param user - The user object to check permissions for
 * @param roles - Optional array of allowed roles. If not provided, role check is skipped.
 * @param scopes - Optional array of required scopes. All scopes must be present.
 * @returns true if the user has permission, false otherwise
 */
export function hasPermission(user: User | null, roles?: Role[], scopes?: Scope[]): boolean {
    if (!user) {
        return false;
    }

    const userRole = user.role as Role;

    // Check if user's role is in the allowed roles
    const roleAllowed = !roles || roles.includes(userRole);

    // Super admin has access to all scopes
    if (userRole === "super_admin") {
        return roleAllowed;
    }

    // Get scopes for the user's role
    const userScopes = roleScopeMap[userRole] || [];

    // Check if all required scopes are available for the user's role
    const scopeAllowed = !scopes || scopes.every(scope => userScopes.includes(scope));

    return roleAllowed && scopeAllowed;
}

/**
 * Filters navigation menu items based on user's scopes.
 * Only items where the user has all required scopes are included.
 * Sections with no visible items are excluded.
 *
 * @param user - The user object to filter menu items for
 * @param menuItems - The navigation sections to filter
 * @returns Filtered navigation sections with only accessible items
 */
export function filterMenuItems(user: User | null, menuItems: NavSection[]): NavSection[] {
    if (!user) {
        return [];
    }

    return menuItems
        .map(section => ({
            ...section,
            items: section.items.filter(item => {
                // If item has no scopes, it's visible to all authenticated users
                if (!item.scope || item.scope.length === 0) {
                    return true;
                }
                // Check if user has all required scopes for this item
                return item.scope.every(scope => hasPermission(user, undefined, [scope]));
            }),
        }))
        .filter(section => section.items.length > 0); // Remove sections with no visible items
}

/**
 * The filterItemsByScope function takes a user and an array of menu items, and returns a new array
 * of menu items that the user has permission to see based on their scopes.
 * It checks if the user has all the required scopes for each menu item and
 * filters out those that the user does not have access to.
 * @param user
 * @param items
 * @returns
 */
export const filterItemsByScope = (user: User | null, items: MenuItem[]): MenuItem[] => {
    if (!user) {
        return [];
    }

    return items.filter(item => {
        if (!item.scopes || item.scopes.length === 0) {
            return true;
        }
        return hasPermission(user, undefined, item.scopes);
    });
};
