import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { serializeUser, userInclude } from "./utils";

const userCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").nullish(),
  lastName: z.string().min(1, "El apellido es requerido").nullish(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  addresses: z
    .array(
      z.object({
        label: z.string(),
        street: z.string(),
        city: z.string(),
        country: z.string(),
        postal: z.string(),
      })
    )
    .optional(),
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

    const { email, password, name, lastName, addresses } = validation.data;

    console.log("5. Creando cliente administrador de Supabase...");
    const supabase = createSupabaseAdminClient();
    console.log("6. Llamando a supabase.auth.admin.createUser...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        role: "USER",
        name: name ?? undefined,
        lastName: lastName ?? undefined,
      },
    });

    if (authError) {
      console.error("-> ERROR DEVUELTO POR SUPABASE AUTH:", authError.message);
      if (authError.message.includes("User already exists")) {
        return NextResponse.json({ error: "El correo ya está registrado." }, { status: 409 });
      }
      throw new Error(`Error de Supabase: ${authError.message}`);
    }

    if (!authData?.user) {
      throw new Error("Supabase no devolvió un usuario válido tras la creación.");
    }
    console.log("7. Usuario creado en Supabase Auth con ID:", authData.user.id);

    console.log("8. Preparando creación del perfil en Prisma...");
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name: name ?? null,
        lastName: lastName ?? null,
        addresses:
          addresses && addresses.length > 0
            ? {
                create: addresses.map(({ label, street, city, country, postal }) => ({
                  label,
                  street,
                  city,
                  country,
                  postal,
                })),
              }
            : undefined,
      },
      include: userInclude,
    });
    console.log("9. Perfil de usuario creado en Prisma con éxito.");

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("-> ERROR NO CONTROLADO EN POST /api/users:", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
