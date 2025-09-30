import {NextResponse} from "next/server";
import {z, ZodError} from "zod";

import {verifyPassword} from "@/utils/auth";

import {getUserByEmail, serializeUser} from "../utils";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());

    const user = await getUserByEmail(payload.email);

    if (!user || !user.password || !verifyPassword(payload.password, user.password)) {
      return NextResponse.json({error: "Credenciales inválidas."}, {status: 401});
    }

    return NextResponse.json({user: serializeUser(user)});
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error logging user in", error);
    return NextResponse.json({error: "No se pudo iniciar sesión."}, {status: 500});
  }
}
