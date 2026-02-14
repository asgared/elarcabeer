import { NextResponse } from "next/server";

import { deleteAdminSession, getAdminSession } from "@/lib/auth/admin";
import { getCapabilitiesForRoles, type Capability } from "@/lib/auth/permissions";
import type { RoleKey } from "@/lib/auth/role-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const roleKeys = session.user.userRoles.map(
    (ur: { role: { key: string } }) => ur.role.key as RoleKey,
  );

  const capabilities = Array.from(getCapabilitiesForRoles(roleKeys));

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: roleKeys,
      capabilities,
    },
  });
}

export async function DELETE() {
  await deleteAdminSession();

  return NextResponse.json({ success: true });
}
