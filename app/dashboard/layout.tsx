import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { FaBook, FaBoxOpen, FaGears } from "react-icons/fa6";

import { SideBar, SideBarNav } from "@/components/dashboard/sidebar";
import { getAdminSession } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

type Props = {
  children: ReactNode;
};

export default async function DashboardRootLayout({ children }: Props) {
  // El DashboardRootLayout ahora solo actúa como un contenedor lógico. 
  // Los layouts anidados (como (admin) o (auth)) se encargan de su propia UI (sidebars, forms, etc.).
  return (
    <div className="dashboard-root">
      {children}
    </div>
  );
}
