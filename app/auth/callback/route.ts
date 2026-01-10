import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth/admin";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createSupabaseServerClient();
        if (supabase) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                // Sync user with Prisma
                const { data: { user } } = await supabase.auth.getUser();

                if (user && user.email) {
                    try {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: user.email }
                        });

                        if (!dbUser) {
                            // Crear usuario en Prisma si no existe
                            await prisma.user.create({
                                data: {
                                    id: user.id, // ID de Supabase
                                    email: user.email,
                                    name: user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0],
                                }
                            });
                            console.log(`Usuario social ${user.email} creado en Prisma.`);
                        } else if (dbUser.id !== user.id) {
                            // Si existe por email pero el ID es distinto, borramos y re-creamos con el ID correcto
                            console.log(`Corrigiendo ID mismatch para ${user.email} en Callback...`);
                            await prisma.$transaction([
                                prisma.user.delete({ where: { email: user.email } }),
                                prisma.user.create({
                                    data: {
                                        id: user.id,
                                        email: user.email,
                                        name: dbUser.name || user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0],
                                        lastName: dbUser.lastName || user.user_metadata.lastName,
                                        role: dbUser.role
                                    }
                                })
                            ]);
                            console.log(`ID sincronizado para ${user.email}`);
                        }

                        // Re-verificamos el rol para sesión administrativa
                        const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
                        if (finalUser?.role === "ADMIN") {
                            await createAdminSession(finalUser.id);
                            console.log(`Sesión administrativa creada para ${user.email}`);
                        }
                    } catch (e) {
                        console.error("Error sincronizando usuario social a Prisma:", e);
                    }
                }

                return NextResponse.redirect(`${origin}${next}`);
            } else {
                console.error("Error exchanging code for session:", error);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
