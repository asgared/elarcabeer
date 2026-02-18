import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<{
    email: string;
    password: string;
  }>;

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado correctamente." },
      { status: 500 }
    );
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  // Intenta encontrar el usuario en Prisma.
  // Primero por ID (que debería ser el de Supabase)
  let user = await prisma.user.findUnique({
    where: { id: authData.user.id },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    // Si no está por ID, buscamos por email.
    // Esto resuelve problemas si el usuario fue creado manualmente o vía seed sin el ID de Supabase.
    const userByEmail = await prisma.user.findUnique({
      where: { email: authData.user.email },
      include: { userRoles: { include: { role: true } } },
    });

    if (userByEmail) {
      // Si lo encontramos por email pero el ID era distinto, lo re-sincronizamos.
      // ✅ Usamos UPDATE para preservar órdenes, direcciones, loyalty y roles.
      try {
        console.log(`-> ID Mismatch en Admin Login: Prisma(${userByEmail.id}) vs Supabase(${authData.user.id}). Recalibrando...`);

        // Borramos sesiones viejas asociadas al ID anterior
        await prisma.adminSession.deleteMany({ where: { userId: userByEmail.id } });

        // Actualizamos el ID del usuario para sincronizarlo con Supabase
        await prisma.user.update({
          where: { id: userByEmail.id },
          data: { id: authData.user.id },
        });

        user = await prisma.user.findUnique({
          where: { id: authData.user.id },
          include: { userRoles: { include: { role: true } } },
        });
        console.log(`ID de usuario sincronizado para ${email}`);
      } catch (error) {
        console.error("Error al sincronizar ID de usuario en Admin Login:", error);
        return NextResponse.json({ error: "No se pudo sincronizar la cuenta administrativa." }, { status: 500 });
      }
    }
  }

  // Check if user has a dashboard-capable role
  const dashboardRoles = ["superadmin", "content_editor", "user_admin"];
  const isAdmin = user?.userRoles.some((ur) => dashboardRoles.includes(ur.role.key));

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "No tienes permisos de administrador." }, { status: 401 });
  }

  // Por si acaso, borramos sesiones del ID nuevo tambien antes de crear la nueva
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });
  await createAdminSession(user.id);

  const roleKeys = user.userRoles.map((ur) => ur.role.key);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleKeys,
    },
  });
}
