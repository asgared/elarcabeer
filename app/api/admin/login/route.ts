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
  let user = await prisma.user.findUnique({ where: { id: authData.user.id } });

  if (!user) {
    // Si no está por ID, buscamos por email. 
    // Esto resuelve problemas si el usuario fue creado manualmente o vía seed sin el ID de Supabase.
    user = await prisma.user.findUnique({ where: { email: authData.user.email } });

    if (user) {
      // Si lo encontramos por email pero el ID era distinto, lo re-sincronizamos.
      try {
        console.log(`-> ID Mismatch en Admin Login: Prisma(${user.id}) vs Supabase(${authData.user.id}). Recalibrando...`);

        // Guardamos datos temporales para no perderlos
        const oldId = user.id;
        const userData = { ...user };

        // Borramos sesiones viejas asociadas al ID anterior
        await prisma.adminSession.deleteMany({ where: { userId: oldId } });

        // Borramos y re-creamos el usuario con el ID correcto de Supabase
        await prisma.$transaction([
          prisma.user.delete({ where: { id: oldId } }),
          prisma.user.create({
            data: {
              id: authData.user.id,
              email: userData.email,
              name: userData.name,
              lastName: userData.lastName,
              role: userData.role,
            }
          })
        ]);

        user = await prisma.user.findUnique({ where: { id: authData.user.id } });
        console.log(`ID de usuario sincronizado para ${email}`);
      } catch (error) {
        console.error("Error al sincronizar ID de usuario en Admin Login:", error);
        return NextResponse.json({ error: "No se pudo sincronizar la cuenta administrativa." }, { status: 500 });
      }
    }
  }

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No tienes permisos de administrador." }, { status: 401 });
  }

  // Por si acaso, borramos sesiones del ID nuevo tambien antes de crear la nueva
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });
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
