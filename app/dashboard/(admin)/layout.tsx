import {ReactNode} from "react";
import {
  FiBarChart2,
  FiFileText,
  FiGift,
  FiGrid,
  FiPackage,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import {AdminShell} from "@/components/admin/admin-shell";
import {SideBar, SideBarNav} from "@/components/dashboard/sidebar";
import {SideBarNavLink} from "@/components/dashboard/sidebar-nav-link";
import {getAdminSession} from "@/lib/auth/admin";

type Props = {
  children: ReactNode;
};

type SidebarSection = {
  title: string;
  links: {href: string; icon: ReactNode; label: string}[];
};

const sidebarSections: SidebarSection[] = [
  {
    title: "Tienda",
    links: [
      {href: "/dashboard/orders", icon: <FiGift />, label: "Órdenes"},
      {href: "/dashboard/products", icon: <FiPackage />, label: "Productos"},
      {href: "/dashboard/categories", icon: <FiTag />, label: "Categorías"},
      {href: "/dashboard/customers", icon: <FiUsers />, label: "Clientes"},
    ],
  },
  {
    title: "Contenido",
    links: [{href: "/dashboard/content", icon: <FiFileText />, label: "Editor CMS"}],
  },
  {
    title: "Negocio",
    links: [{href: "/dashboard/analytics", icon: <FiBarChart2 />, label: "Analíticas"}],
  },
];

export default async function DashboardAdminLayout({children}: Props) {
  const session = await getAdminSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const sidebar = (
    <SideBar>
      <SideBarNav>
        <SideBarNavLink href="/dashboard" icon={<FiGrid />}>
          Dashboard
        </SideBarNavLink>

        {sidebarSections.map((section) => (
          <div key={section.title} className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.links.map((link) => (
                <SideBarNavLink key={link.href} href={link.href} icon={link.icon}>
                  {link.label}
                </SideBarNavLink>
              ))}
            </div>
          </div>
        ))}
      </SideBarNav>
    </SideBar>
  );

  return (
    <AdminShell user={user} sidebar={sidebar}>
      {children}
    </AdminShell>
  );
}
