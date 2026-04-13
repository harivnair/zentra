import { routePermissions } from "@/config/permissions";
import { RoutePermission } from "@/types/auth";

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
