import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth/admin";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const paramsToSign = await request.json();
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      throw new Error("La API secret de Cloudinary no está configurada en las variables de entorno.");
    }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error al generar la firma de Cloudinary:", error);
    const message = error instanceof Error ? error.message : "Error desconocido al generar la firma.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
