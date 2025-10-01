import {NextResponse} from "next/server";

import {deleteAdminSession, getAdminSession} from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({user: null});
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    }
  });
}

export async function DELETE() {
  await deleteAdminSession();

  return NextResponse.json({success: true});
}
