import type { RoleKey } from "./role-types";

/**
 * The role key that grants full administrative access.
 * Only assigned manually via Supabase / direct DB insert.
 */
export const SUPERADMIN_KEY: RoleKey = "superadmin";

/**
 * Route-level permission map.
 *
 * Keys are path prefixes. The middleware (or layout guard) will match the
 * most-specific prefix first. If a route isn't listed, it falls through
 * to the parent prefix.
 *
 * Values are arrays of role keys that are allowed to access the route.
 * An empty array means "no one" (useful as explicit deny placeholder).
 */
export const ROUTE_PERMISSIONS: Record<string, RoleKey[]> = {
    // General dashboard — any admin role can view the overview
    "/dashboard": ["superadmin", "content_editor", "viewer", "user_admin"],

    // Content management
    "/dashboard/content": ["superadmin", "content_editor"],

    // Customer / user management
    "/dashboard/customers": ["superadmin", "user_admin"],

    // Orders — visible to broader admin roles
    "/dashboard/orders": ["superadmin", "content_editor", "user_admin"],

    // Analytics — managers & above
    "/dashboard/analytics": ["superadmin"],

    // Store management
    "/dashboard/stores": ["superadmin"],

    // Categories
    "/dashboard/categories": ["superadmin", "content_editor"],

    // Loyalty programme
    "/dashboard/loyalty": ["superadmin", "user_admin"],

    // Settings — superadmin only
    "/dashboard/settings": ["superadmin"],
};

/**
 * Resolve the allowed roles for a given pathname.
 *
 * Walks from the most-specific prefix to the least-specific one,
 * returning the first match. If nothing matches, returns `null`
 * (route is not protected by RBAC).
 */
export function getAllowedRoles(pathname: string): RoleKey[] | null {
    // Sort keys longest-first so "/dashboard/content" beats "/dashboard"
    const sorted = Object.keys(ROUTE_PERMISSIONS).sort(
        (a, b) => b.length - a.length,
    );

    for (const prefix of sorted) {
        if (pathname === prefix || pathname.startsWith(prefix + "/")) {
            return ROUTE_PERMISSIONS[prefix];
        }
    }

    return null;
}
