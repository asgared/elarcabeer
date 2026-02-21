import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const OMITTED_SIGNATURE_KEYS = new Set(["file", "api_key", "resource_type", "signature"]);

function signCloudinaryRequest(
    params: Record<string, string | number | null | undefined | string[]>,
    apiSecret: string,
) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => {
            if (OMITTED_SIGNATURE_KEYS.has(key)) return false;
            if (value === undefined || value === null) return false;
            if (typeof value === "string") return value.length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return true;
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => {
            if (Array.isArray(value)) return `${key}=${value.join(",")}`;
            return `${key}=${value}`;
        })
        .join("&");

    return createHash("sha1").update(`${filteredParams}${apiSecret}`).digest("hex");
}

/**
 * POST /api/users/avatar
 *
 * Two modes:
 * 1. { action: "sign" }        → returns Cloudinary upload signature
 * 2. { action: "save", url }   → persists the uploaded URL to the user's avatarUrl
 */
export async function POST(request: Request) {
    try {
        const supabase = (await createSupabaseServerClient()) as any;
        if (!supabase) {
            return NextResponse.json({ error: "No se pudo crear el cliente de Supabase." }, { status: 500 });
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
            return NextResponse.json({ error: "No autenticado." }, { status: 401 });
        }

        const body = await request.json();
        const action = body?.action;

        // ----- MODE 1: Sign an upload -----
        if (action === "sign") {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const apiSecret = process.env.CLOUDINARY_API_SECRET;

            if (!cloudName || !apiKey || !apiSecret) {
                return NextResponse.json(
                    { error: "Las credenciales de Cloudinary no están configuradas." },
                    { status: 500 },
                );
            }

            const timestamp = Math.floor(Date.now() / 1000);
            const folder = "elarcabeer/avatars";

            const paramsToSign: Record<string, string | number> = {
                timestamp,
                folder,
            };

            const signature = signCloudinaryRequest(paramsToSign, apiSecret);

            return NextResponse.json({
                signature,
                timestamp,
                apiKey,
                cloudName,
                folder,
            });
        }

        // ----- MODE 2: Save uploaded URL -----
        if (action === "save") {
            const url = body?.url;
            if (!url || typeof url !== "string") {
                return NextResponse.json({ error: "URL inválida." }, { status: 400 });
            }

            await prisma.user.update({
                where: { email: user.email },
                data: { avatarUrl: url },
            });

            return NextResponse.json({ success: true, avatarUrl: url });
        }

        return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    } catch (error) {
        console.error("Error en /api/users/avatar:", error);
        const message = error instanceof Error ? error.message : "Error desconocido.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
