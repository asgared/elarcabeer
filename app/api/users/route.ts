import { NextResponse } from "next/server";
import { z } from "zod"; // Es buena práctica usar Zod para validación

import { prisma } from "@/lib/prisma";
// import { createSupabaseAdminClient } from "@/lib/supabase/admin"; // Necesitamos un cliente admin
import { serializeUser, userInclude } from "./utils";

// Definimos un esquema de validación para la creación de usuarios
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
  try {
    const body = await request.json();
    const validation = userCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { name, email, password, addresses } = validation.data;

    // --- INICIO DE LA NUEVA LÓGICA ---

    // 1. Creamos el usuario en Supabase Auth primero
    // const supabase = createSupabaseAdminClient();
    // const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    //   email,
    //   password,
    //   email_confirm: false, // Lo ponemos en `false` para facilitar las pruebas en desarrollo
    //   user_metadata: {
    //     role: "USER",
    //     name: name,
    //   },
    // });

    // if (authError) {
    //   // Si el error es que el usuario ya existe, devolvemos un mensaje amigable
    //   if (authError.message.includes("User already exists")) {
    //     return NextResponse.json({ error: "El correo ya está registrado." }, { status: 409 });
    //   }
    //   // Para otros errores de Supabase, los lanzamos para que los capture el catch genérico
    //   throw new Error(authError.message);
    // }
    
    // if (!authData.user) {
    //     throw new Error("No se pudo crear el usuario en Supabase.");
    // }

    // 2. Con el usuario ya creado en Supabase, creamos el perfil en Prisma
    // const user = await prisma.user.create({
    //   data: {
    //     id: authData.user.id, // <-- Usamos el ID de Supabase para sincronizar
    //     email,
    //     name,
    //     role: "USER",
    //     addresses: addresses
    //       ? {
    //           create: addresses.map(({ label, street, city, country, postal }) => ({
    //             label,
    //             street,
    //             city,
    //             country,
    //             postal,
    //           })),
    //         }
    //       : undefined,
    //   },
    //   include: userInclude,
    // });

    // --- FIN DE LA NUEVA LÓGICA ---

    // return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    console.error("Error creating user", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}