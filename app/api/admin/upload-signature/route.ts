import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { requireAdmin } from "@/lib/auth/admin";

const OMITTED_SIGNATURE_KEYS = new Set(["file", "api_key", "resource_type", "signature"]);

function signCloudinaryRequest(
  params: Record<string, string | number | null | undefined | string[]>,
  apiSecret: string,
) {
  const filteredParams = Object.entries(params)
    .filter(([key, value]) => {
      if (OMITTED_SIGNATURE_KEYS.has(key)) {
        return false;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === "string") {
        return value.length > 0;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    })
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=${value.join(",")}`;
      }

      return `${key}=${value}`;
    })
    .join("&");

  return createHash("sha1").update(`${filteredParams}${apiSecret}`).digest("hex");
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const paramsToSign = (await request.json()) as Record<
      string,
      string | number | null | undefined | string[]
    >;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      throw new Error("La API secret de Cloudinary no está configurada en las variables de entorno.");
    }
    const signature = signCloudinaryRequest(paramsToSign, apiSecret);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error al generar la firma de Cloudinary:", error);
    const message = error instanceof Error ? error.message : "Error desconocido al generar la firma.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
