import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserByEmail, serializeUser } from "../utils";
import { ValidationError, validateLoginPayload } from "../validation";
import { createAdminSession } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const payload = validateLoginPayload(await request.json());
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase no está configurado correctamente." },
        { status: 500 }
      );
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (authError) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }
    const user = await getUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    if (user.role === "ADMIN") {
      await createAdminSession(user.id);
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Error logging user in", error);
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
