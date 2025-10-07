import {NextResponse} from "next/server";

import {getUserByEmail, serializeUser} from "../utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({error: "Falta el correo electrónico."}, {status: 400});
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({error: "Usuario no encontrado."}, {status: 404});
  }

  return NextResponse.json({user: serializeUser(user)});
}
