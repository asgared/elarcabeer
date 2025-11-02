import type {Metadata} from "next";
import {ReactNode} from "react";
import {redirect} from "next/navigation";

import {AdminShell} from "@/components/admin/admin-shell";
import {DashboardSidebar} from "./dashboard-sidebar";
import {requireAdmin} from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

type Props = {
  children: ReactNode;
};

export default async function DashboardRootLayout({children}: Props) {
  try {
    const session = await requireAdmin();
    const {user} = session;

    return (
      <AdminShell user={user} sidebar={<DashboardSidebar />}>
        {children}
      </AdminShell>
    );
  } catch (error) {
    return redirect("/dashboard/login");
  }
}
