import {NextResponse} from "next/server";

import {createAdminSession} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";
import {verifyPassword} from "@/utils/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<{
    email: string;
    password: string;
  }>;

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({error: "Correo y contraseña son obligatorios."}, {status: 400});
  }

  const user = await prisma.user.findUnique({where: {email}});

  if (!user || !user.password || user.role !== "ADMIN") {
    return NextResponse.json({error: "Credenciales inválidas."}, {status: 401});
  }

  if (!verifyPassword(password, user.password)) {
    return NextResponse.json({error: "Credenciales inválidas."}, {status: 401});
  }

  await prisma.adminSession.deleteMany({where: {userId: user.id}});
  await createAdminSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}
