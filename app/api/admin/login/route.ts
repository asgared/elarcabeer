import {NextResponse} from "next/server";

import {createAdminSession} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";
import {createSupabaseServerClient} from "@/lib/supabase/server";

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

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {error: "Supabase no está configurado correctamente."},
      {status: 500}
    );
  }

  const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({error: "Credenciales inválidas."}, {status: 401});
  }

  const user = await prisma.user.findUnique({where: {id: authData.user.id}});

  if (!user || user.role !== "ADMIN") {
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
