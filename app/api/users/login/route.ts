import {NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";
import {createRouteSupabaseClient} from "@/lib/supabase/route";

import {serializeUser, userInclude} from "../utils";
import {ValidationError, validateLoginPayload} from "../validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = validateLoginPayload(await request.json());
    const supabase = createRouteSupabaseClient();
    const {data, error} = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error || !data.user) {
      return NextResponse.json({error: error?.message ?? "Credenciales inválidas."}, {status: 401});
    }

    const user = await prisma.user.upsert({
      where: {id: data.user.id},
      create: {
        id: data.user.id,
        email: data.user.email ?? payload.email,
        name: data.user.user_metadata?.name ?? null,
        password: null,
        role: "USER"
      },
      update: {
        email: data.user.email ?? payload.email,
        name: data.user.user_metadata?.name ?? null
      },
      include: userInclude
    });

    return NextResponse.json({session: data.session, user: serializeUser(user)});
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error logging user in", error);
    return NextResponse.json({error: "No se pudo iniciar sesión."}, {status: 500});
  }
}
