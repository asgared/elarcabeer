import {NextResponse} from "next/server";
import {v2 as cloudinary} from "cloudinary";

import {requireAdmin} from "@/lib/auth/admin";

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const paramsToSign = await request.json();

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const signature = cloudinary.utils.api_sign_request(paramsToSign);

    return NextResponse.json({signature});
  } catch (error) {
    console.error("Failed to generate Cloudinary signature", error);

    return NextResponse.json(
      {error: "No se pudo generar la firma de subida."},
      {status: 500}
    );
  }
}
