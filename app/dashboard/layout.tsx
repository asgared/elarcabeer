import type {Metadata} from "next";
import {ReactNode} from "react";
import {FaBook, FaBoxOpen, FaGears} from "react-icons/fa6";
import type {IconType} from "react-icons";

import {SideBar, SideBarNav} from "@/components/dashboard/sidebar";
import {SideBarNavLink} from "@/components/dashboard/sidebar-nav-link";
import {getAdminSession} from "@/lib/auth/admin";

const NAVIGATION_LINKS: Array<{href: string; label: string; icon: IconType}> = [
  {href: "/dashboard", label: "Panel", icon: FaGears},
  {href: "/dashboard/content", label: "Contenido", icon: FaBook},
  {href: "/dashboard/products", label: "Productos", icon: FaBoxOpen},
];

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
          {NAVIGATION_LINKS.map(({href, label, icon: Icon}) => (
            <SideBarNavLink
              key={href}
              href={href}
              icon={<Icon aria-hidden className="dashboard-sidebar__icon" />}
            >
              {label}
            </SideBarNavLink>
          ))}
        </SideBarNav>
      </SideBar>
      <div className="dashboard-layout__content">{children}</div>
    </div>
  );
}
