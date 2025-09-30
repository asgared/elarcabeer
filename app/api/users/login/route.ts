import {NextResponse} from "next/server";

import {verifyPassword} from "@/utils/auth";

import {getUserByEmail, serializeUser} from "../utils";
import {ValidationError, validateLoginPayload} from "../validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = validateLoginPayload(await request.json());

    const user = await getUserByEmail(payload.email);

    if (!user || !user.password || !verifyPassword(payload.password, user.password)) {
      return NextResponse.json({error: "Credenciales inválidas."}, {status: 401});
    }

    return NextResponse.json({user: serializeUser(user)});
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error logging user in", error);
    return NextResponse.json({error: "No se pudo iniciar sesión."}, {status: 500});
  }
}
