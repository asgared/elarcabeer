import {NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";
import {createRouteSupabaseClient} from "@/lib/supabase/route";

import {serializeUser, userInclude} from "./utils";
import {ValidationError, validateCreateUserPayload} from "./validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = validateCreateUserPayload(await request.json());
    const supabase = createRouteSupabaseClient();
    const {data, error} = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name ?? undefined
        }
      }
    });

    if (error) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    const authUser = data.user;

    if (!authUser) {
      return NextResponse.json({error: "No se pudo crear la cuenta."}, {status: 500});
    }

    const user = await prisma.user.upsert({
      where: {id: authUser.id},
      create: {
        id: authUser.id,
        email: authUser.email ?? payload.email,
        name: payload.name ?? authUser.user_metadata?.name ?? null,
        password: null,
        role: "USER",
        addresses: payload.addresses
          ? {
              create: payload.addresses.map(({label, street, city, country, postal}) => ({
                label,
                street,
                city,
                country,
                postal
              }))
            }
          : undefined
      },
      update: {
        email: authUser.email ?? payload.email,
        name: payload.name ?? authUser.user_metadata?.name ?? null
      },
      include: userInclude
    });

    return NextResponse.json({session: data.session, user: serializeUser(user)}, {status: 201});
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error creating user", error);
    return NextResponse.json({error: "No se pudo crear la cuenta."}, {status: 500});
  }
}
