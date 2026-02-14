/**
 * RBAC Role Keys
 *
 * Each key maps to a row in the `Role` table. New roles should be added
 * here AND in the seed script.
 */
export const ROLE_KEYS = [
    "superadmin",
    "content_editor",
    "viewer",
    "user_admin",
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];
