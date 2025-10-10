"use server";

import {deleteAdminSession} from "@/lib/auth/admin";

export async function logoutAdmin() {
  await deleteAdminSession();
}
