import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { RoleKey } from "./role-types";

/**
 * Server-side helper — returns the role keys for the currently
 * authenticated Supabase user, or `null` when there is no session.
 *
 * This queries the `user_roles` + `Role` tables via Prisma, NOT
 * app_metadata, so RLS on the Supabase side is irrelevant here
 * (Prisma uses the service connection via DATABASE_URL).
 *
 * Usage (in Server Components, Route Handlers, or Server Actions):
 *
 *   const roles = await getUserRoles();
 *   if (!roles || !roles.includes("superadmin")) redirect("/");
 */
export async function getUserRoles(): Promise<RoleKey[] | null> {
    const supabase = await createSupabaseServerClient();

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

    return userRoles.map((ur) => ur.role.key as RoleKey);
}

/**
 * Checks whether the currently authenticated user holds at least one
 * of the given roles.
 */
export async function hasAnyRole(requiredRoles: RoleKey[]): Promise<boolean> {
    const roles = await getUserRoles();

    if (!roles) {
        return false;
    }

    return roles.some((r) => requiredRoles.includes(r));
}
