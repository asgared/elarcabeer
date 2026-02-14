import type { RoleKey } from "./role-types";

// ─── Capability Definitions ────────────────────────────────────────────────

export const CAPABILITIES = [
    "dashboard:access",
    "content:read",
    "content:write",
    "users:read",
    "users:write",
    "orders:read",
    "orders:write",
    "categories:read",
    "categories:write",
    "stores:manage",
    "analytics:read",
    "loyalty:manage",
    "settings:manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

// ─── Role → Capabilities Mapping ───────────────────────────────────────────

/**
 * Use `"*"` as a wildcard to grant ALL capabilities (superadmin only).
 * `viewer` explicitly has NO `dashboard:access` — blocked at middleware.
 */
const ROLE_CAPABILITIES: Record<RoleKey, readonly (Capability | "*")[]> = {
    superadmin: ["*"],
    content_editor: [
        "dashboard:access",
        "content:read",
        "content:write",
        "categories:read",
        "categories:write",
        "orders:read",
    ],
    user_admin: [
        "dashboard:access",
        "users:read",
        "users:write",
        "orders:read",
        "orders:write",
        "loyalty:manage",
    ],
    viewer: [],
    // ↑ viewer has NO capabilities — cannot enter /dashboard
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export const SUPERADMIN_KEY: RoleKey = "superadmin";

/** Expand roles into a flat Set of capabilities. */
export function getCapabilitiesForRoles(roles: RoleKey[]): Set<Capability> {
    const caps = new Set<Capability>();

    for (const role of roles) {
        const mapping = ROLE_CAPABILITIES[role];
        if (!mapping) continue;

        if (mapping.includes("*")) {
            // Wildcard: grant everything
            for (const c of CAPABILITIES) caps.add(c);
            return caps; // short-circuit, already has all
        }

        for (const c of mapping) {
            caps.add(c as Capability);
        }
    }

    return caps;
}

/** Check a single capability against a resolved set. */
export function hasCapability(
    capabilities: Set<Capability>,
    cap: Capability,
): boolean {
    return capabilities.has(cap);
}

/** Check if ANY of the required capabilities is present. */
export function hasAnyCapability(
    capabilities: Set<Capability>,
    required: Capability[],
): boolean {
    return required.some((c) => capabilities.has(c));
}

/** Shorthand: can this capability set enter /dashboard at all? */
export function isDashboardAllowed(capabilities: Set<Capability>): boolean {
    return capabilities.has("dashboard:access");
}
