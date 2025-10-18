import type {Metadata} from "next";
import Link from "next/link";
import {ReactNode} from "react";
import {FaBook, FaBoxOpen, FaGears} from "react-icons/fa6";

import {SideBar, SideBarNav} from "@/components/dashboard/sidebar";
import {getAdminSession} from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

type Props = {
  children: ReactNode;
};

export default async function DashboardRootLayout({children}: Props) {
  const session = await getAdminSession();
  const user = session?.user;

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="dashboard-layout">
      <SideBar>
        <SideBarNav>
          <Link href="/dashboard">
            <FaGears aria-hidden className="dashboard-sidebar__icon" />
            <span>Panel</span>
          </Link>
          <Link href="/dashboard/content">
            <FaBook aria-hidden className="dashboard-sidebar__icon" />
            <span>Contenido</span>
          </Link>
          <Link href="/dashboard/products">
            <FaBoxOpen aria-hidden className="dashboard-sidebar__icon" />
            <span>Productos</span>
          </Link>
        </SideBarNav>
      </SideBar>
      <div className="dashboard-layout__content">{children}</div>
    </div>
  );
}
