import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { serializeUser, userInclude } from "./utils";

const userCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").nullable(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  addresses: z.array(z.object({
    label: z.string(),
    street: z.string(),
    city: z.string(),
    country: z.string(),
    postal: z.string()
  })).optional()
});


export async function POST(request: Request) {
  console.log("\n--- INICIANDO PETICIÓN POST /api/users ---");
  try {
    const body = await request.json();
    console.log("1. Cuerpo de la petición recibido:", body);

    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      console.error("-> FALLO: Validación de Zod falló.", validation.error.flatten());
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    console.log("2. Validación con Zod exitosa.");

    const { name, email, password, addresses } = validation.data;

    const supabase = createSupabaseAdminClient();
    console.log("3. Creando usuario en Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        role: "USER",
        name: name,
      },
    });

    if (authError) {
      console.error("-> FALLO: Supabase Auth devolvió un error:", authError.message);
      if (authError.message.includes("User already exists")) {
        return NextResponse.json({ error: "El correo ya está registrado." }, { status: 409 });
      }
      throw new Error(`Error de Supabase: ${authError.message}`);
    }
    
    if (!authData.user) {
        throw new Error("No se pudo crear el usuario en Supabase (respuesta vacía).");
    }
    console.log("4. Usuario creado en Supabase Auth con ID:", authData.user.id);

    console.log("5. Creando perfil de usuario en Prisma...");
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role: "USER",
        addresses: addresses
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
    console.log("6. Perfil de usuario creado en Prisma con éxito.");

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });

  } catch (error) {
    console.error("-> FALLO CATASTRÓFICO DENTRO DEL BLOQUE TRY:", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}