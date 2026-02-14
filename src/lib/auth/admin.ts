import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

import { SUPERADMIN_KEY } from "./permissions";

const SESSION_COOKIE = "elarca_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

function buildExpirationDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = buildExpirationDate();

  await prisma.adminSession.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteAdminSession() {
  const cookie = cookies().get(SESSION_COOKIE);

  if (!cookie) {
    return;
  }

  const tokenHash = hashToken(cookie.value);

  await prisma.adminSession.deleteMany({ where: { tokenHash } });

  cookies().delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookie = cookies().get(SESSION_COOKIE);

  if (!cookie) {
    return null;
  }

  const tokenHash = hashToken(cookie.value);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          userRoles: { include: { role: true } },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

/** Helper — check whether a session user holds at least one of the given role keys. */
export function sessionHasRole(
  session: Awaited<ReturnType<typeof getAdminSession>>,
  ...keys: string[]
): boolean {
  if (!session) return false;
  return session.user.userRoles.some((ur) => keys.includes(ur.role.key));
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY)) {
    redirect("/dashboard/login");
  }

  return session;
}