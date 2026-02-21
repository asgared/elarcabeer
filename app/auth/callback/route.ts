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
        // @supabase/ssr@0.4.0 types don't fully expose auth methods — cast needed
        const supabase = (await createSupabaseServerClient()) as any;
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

                        // Extract Google avatar from user metadata
                        const googleAvatar: string | null =
                            user.user_metadata?.avatar_url
                            ?? user.user_metadata?.picture
                            ?? null;

                        // Split full name if available
                        let name = user.user_metadata.name || user.email.split('@')[0];
                        let lastName: string | null = null;
                        let secondLastName: string | null = null;

                        const fullName = user.user_metadata.full_name;
                        if (fullName) {
                            const parts = fullName.trim().split(/\s+/);
                            if (parts.length > 0) {
                                name = parts[0];
                                if (parts.length > 1) {
                                    lastName = parts[1];
                                }
                                if (parts.length > 2) {
                                    secondLastName = parts.slice(2).join(" ");
                                }
                            }
                        }

                        if (!dbUser) {
                            // Crear usuario en Prisma si no existe
                            await prisma.user.create({
                                data: {
                                    id: user.id, // ID de Supabase
                                    email: user.email,
                                    name,
                                    lastName,
                                    secondLastName,
                                    avatarUrl: googleAvatar,
                                }
                            });
                            console.log(`Usuario social ${user.email} creado en Prisma.`);
                        } else if (dbUser.id !== user.id) {
                            // Si existe por email pero el ID es distinto, actualizamos el ID
                            // ✅ Usamos UPDATE para preservar órdenes, direcciones, loyalty y roles
                            console.log(`Corrigiendo ID mismatch para ${user.email} en Callback...`);
                            await prisma.user.update({
                                where: { id: dbUser.id },
                                data: { id: user.id },
                            });
                            console.log(`ID sincronizado para ${user.email}`);
                        } else if (!dbUser.avatarUrl && googleAvatar) {
                            // Soft-sync: fill avatar if user logged in via Google but had no avatar
                            await prisma.user.update({
                                where: { id: dbUser.id },
                                data: { avatarUrl: googleAvatar },
                            });
                            console.log(`Avatar sincronizado para ${user.email}`);
                        }

                        // Re-verificamos los roles para sesión administrativa
                        const finalUser = await prisma.user.findUnique({
                            where: { id: user.id },
                            include: { userRoles: { include: { role: true } } },
                        });
                        const dashboardRoles = ["superadmin", "content_editor", "user_admin"];
                        const hasDashboardAccess = finalUser?.userRoles.some(
                            (ur: { role: { key: string } }) => dashboardRoles.includes(ur.role.key)
                        );
                        if (hasDashboardAccess && finalUser) {
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
