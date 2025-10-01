import {ReactNode} from "react";

import {requireAdmin} from "@/lib/auth/admin";
import {AdminShell} from "@/components/admin/admin-shell";

type Props = {
  children: ReactNode;
};

export default async function AdminProtectedLayout({children}: Props) {
  const session = await requireAdmin();

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
