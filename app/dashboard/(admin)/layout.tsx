import {ReactNode} from "react";

import {AdminShell} from "@/components/admin/admin-shell";
import {getAdminSession} from "@/lib/auth/admin";

type Props = {
  children: ReactNode;
};

export default async function DashboardAdminLayout({children}: Props) {
  const session = await getAdminSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
