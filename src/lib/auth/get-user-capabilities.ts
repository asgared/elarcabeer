import { cache } from "react";
import { redirect } from "next/navigation";

import { getUserRoles } from "./get-user-roles";
import {
    type Capability,
    getCapabilitiesForRoles,
    hasCapability,
    isDashboardAllowed,
} from "./permissions";

// ─── Cached capability resolver ────────────────────────────────────────────

/**
 * Returns the resolved capability Set for the current user.
 *
 * Wrapped in React `cache()` so multiple calls within the same
 * server request only hit the DB once.
 *
 * Returns an empty Set if there's no authenticated user.
 */
export const getUserCapabilities = cache(
    async (): Promise<Set<Capability>> => {
        const roles = await getUserRoles();

        if (!roles || roles.length === 0) {
            return new Set<Capability>();
        }

        return getCapabilitiesForRoles(roles);
    },
);

// ─── Enforcement helpers ───────────────────────────────────────────────────

/**
 * Server-side gate — redirects to `/` if the current user lacks
 * ALL of the required capabilities.
 *
 * Usage in layouts / pages:
 *   await requireCapability("dashboard:access");
 *   await requireCapability("content:read", "content:write");
 */
export async function requireCapability(
    ...required: Capability[]
): Promise<Set<Capability>> {
    const caps = await getUserCapabilities();

    for (const cap of required) {
        if (!hasCapability(caps, cap)) {
            redirect("/");
        }
    }

    return caps;
}

/**
 * Server-side gate — redirects if user cannot access dashboard at all.
 * Returns the full capability Set on success.
 */
export async function requireDashboardAccess(): Promise<Set<Capability>> {
    const caps = await getUserCapabilities();

    if (!isDashboardAllowed(caps)) {
        redirect("/");
    }

    return caps;
}
