import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { RoleKey } from "./role-types";

/**
 * Server-side helper — returns the role keys for the currently
 * authenticated Supabase user, or `null` when there is no session.
 *
 * Wrapped in React `cache()` for per-request deduplication:
 * multiple calls within the same server request only query once.
 */
export const getUserRoles = cache(
    async (): Promise<RoleKey[] | null> => {
        // @supabase/ssr@0.4.0 types don't fully expose auth methods
        const supabase = (await createSupabaseServerClient()) as any;

        if (!supabase) {
            return null;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
            include: { role: true },
        });

        return userRoles.map(
            (ur: { role: { key: string } }) => ur.role.key as RoleKey,
        );
    },
);

/**
 * Checks whether the currently authenticated user holds at least one
 * of the given roles.
 */
export async function hasAnyRole(
    requiredRoles: RoleKey[],
): Promise<boolean> {
    const roles = await getUserRoles();

    if (!roles) {
        return false;
    }

    return roles.some((r) => requiredRoles.includes(r));
}
