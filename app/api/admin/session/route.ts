import { NextResponse } from "next/server";

import { deleteAdminSession, getAdminSession, sessionHasRole } from "@/lib/auth/admin";
import { SUPERADMIN_KEY } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY)) {
    return NextResponse.json({ user: null });
  }

  const roleKeys = session.user.userRoles.map((ur) => ur.role.key);

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: roleKeys,
    },
  });
}

export async function DELETE() {
  await deleteAdminSession();

  return NextResponse.json({ success: true });
}
