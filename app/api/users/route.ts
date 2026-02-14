import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const userCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").nullish(),
  lastName: z.string().min(1, "El apellido es requerido").nullish(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: Request) {
  console.log("\n--- INICIANDO PETICIÓN POST /api/users ---");

  try {
    console.log("1. Leyendo y parseando el cuerpo de la petición...");
    const body = await request.json();
    const { password: rawPassword, ...restBody } = body ?? {};
    console.log("2. Cuerpo recibido (password oculto):", {
      ...restBody,
      password: rawPassword ? "[OCULTO]" : undefined,
    });

    console.log("3. Validando datos con Zod...");
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      console.error("-> ERROR DE VALIDACIÓN EN ZOD:", validation.error.flatten());
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    console.log("4. Validación con Zod completada con éxito.");

    const { email, password, name, lastName } = validation.data;

    console.log("5. Creando cliente administrador de Supabase...");
    const supabase = createSupabaseAdminClient();

    console.log("6. Verificando si el usuario ya existe en Supabase Auth...");
    let authUser: { id: string; email?: string } | null = null;

    // Intentamos buscar por email antes de intentar crear
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("-> Error al listar usuarios:", listError.message);
    } else {
      const existingUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        console.log("-> El usuario ya existe en Supabase Auth con ID:", existingUser.id);
        authUser = { id: existingUser.id, email: existingUser.email };
      }
    }

    if (!authUser) {
      console.log("-> El usuario no existe. Intentando crear en Supabase Auth...");
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          name: name ?? undefined,
          lastName: lastName ?? undefined,
        },
      });

      if (authError) {
        // Doble verificación por si acaso hubo una race condition
        if (authError.message.includes("already exists")) {
          const { data: retryList } = await supabase.auth.admin.listUsers();
          const retryUser = retryList?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (retryUser) {
            authUser = { id: retryUser.id, email: retryUser.email };
          }
        }

        if (!authUser) {
          console.error("-> ERROR DEVUELTO POR SUPABASE AUTH:", authError.message);
          throw new Error(`Error de Supabase: ${authError.message}`);
        }
      } else if (authData?.user) {
        authUser = { id: authData.user.id, email: authData.user.email };
        console.log("7. Usuario creado exitosamente con ID:", authUser.id);
      }
    }

    if (!authUser) {
      throw new Error("No se pudo obtener la información del usuario de Supabase.");
    }

    // --- SYNC WITH PRISMA ---
    console.log("8. Sincronizando usuario con Prisma...");
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email! }
      });

      if (dbUser) {
        if (dbUser.id !== authUser.id) {
          console.log(`-> ID Mismatch detectado en API: Prisma(${dbUser.id}) vs Supabase(${authUser.id}). Corrigiendo...`);
          // No se puede actualizar el ID directamente en Prisma, así que borramos y creamos
          await prisma.$transaction([
            prisma.user.delete({ where: { email: authUser.email! } }),
            prisma.user.create({
              data: {
                id: authUser.id,
                email: authUser.email!,
                name: name ?? dbUser.name,
                lastName: lastName ?? dbUser.lastName,
              }
            })
          ]);
          console.log("-> Usuario re-sincronizado con nuevo ID.");
        } else {
          // ID coincide, solo actualizamos metadatos si es necesario
          await prisma.user.update({
            where: { id: authUser.id },
            data: {
              name: name ?? undefined,
              lastName: lastName ?? undefined,
            }
          });
          console.log("-> Usuario actualizado en Prisma.");
        }
      } else {
        // No existe, lo creamos
        await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email!,
            name: name ?? null,
            lastName: lastName ?? null,
          }
        });
        console.log("-> Usuario creado en Prisma.");
      }
      console.log("9. Usuario sincronizado en Prisma satisfactoriamente.");
    } catch (prismaError) {
      console.error("-> ERROR CRÍTICO AL SINCRONIZAR CON PRISMA EN API:", prismaError);
      // No lanzamos error para no romper el flujo de Supabase si Prisma falla
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.id,
          email: authUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("-> ERROR NO CONTROLADO EN POST /api/users:", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
