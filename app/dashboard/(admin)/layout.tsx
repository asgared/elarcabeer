// app/dashboard/(admin)/layout.tsx

import { ReactNode } from "react";
import {
  FiFileText,
  FiGrid,
  FiPackage,
  FiUsers,
  FiGift,
  FiTag,
  FiBarChart2,
} from "react-icons/fi";

import { AdminShell } from "@/components/admin/admin-shell";
import { SideBar, SideBarNav } from "@/components/dashboard/sidebar";
// Importamos el componente de enlace inteligente que creamos
import { SideBarNavLink } from "@/components/dashboard/sidebar-nav-link"; 
import { getAdminSession } from "@/lib/auth/admin";

type Props = {
  children: ReactNode;
};

export default async function DashboardAdminLayout({ children }: Props) {
  const session = await getAdminSession();
  const user = session?.user;

  if (!user) {
    // Aquí puedes manejar la redirección al login si lo prefieres
    return null;
  }

  // Construimos el componente de la barra lateral aquí
  const sidebar = (
    <SideBar>
      <SideBarNav>
        <SideBarNavLink href="/dashboard" icon={<FiGrid />}>
          Dashboard
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/content" icon={<FiFileText />}>
          Contenido
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/products" icon={<FiPackage />}>
          Productos
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/categories" icon={<FiTag />}>
          Categorías
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/orders" icon={<FiGift />}>
          Órdenes
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/customers" icon={<FiUsers />}>
          Clientes
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/analytics" icon={<FiBarChart2 />}>
          Analíticas
        </SideBarNavLink>
      </SideBarNav>
    </SideBar>
  );

  // Pasamos el usuario y la barra lateral al AdminShell
  return (
    <AdminShell user={user} sidebar={sidebar}>
      {children}
    </AdminShell>
  );
}