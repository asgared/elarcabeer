// app/dashboard/(admin)/layout.tsx

import { Box, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  FiFileText,
  FiGrid,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTag,
  FiBarChart2,
  FiSettings,
  FiMapPin,
  FiStar,
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
          Resumen
        </SideBarNavLink>

        <Box py={2} />
        <Text px={4} fontSize="xs" fontWeight="bold" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="wider">
          Contenido
        </Text>
        <SideBarNavLink href="/dashboard/content" icon={<FiFileText />}>
          Secciones CMS
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/products" icon={<FiPackage />}>
          Productos
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/categories" icon={<FiTag />}>
          Categorías
        </SideBarNavLink>

        <Box py={2} />
        <Text px={4} fontSize="xs" fontWeight="bold" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="wider">
          Ventas
        </Text>
        <SideBarNavLink href="/dashboard/orders" icon={<FiShoppingCart />}>
          Órdenes
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/customers" icon={<FiUsers />}>
          Clientes
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/loyalty" icon={<FiStar />}>
          Lealtad
        </SideBarNavLink>

        <Box py={2} />
        <Text px={4} fontSize="xs" fontWeight="bold" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="wider">
          Sistema
        </Text>
        <SideBarNavLink href="/dashboard/stores" icon={<FiMapPin />}>
          Tiendas
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/analytics" icon={<FiBarChart2 />}>
          Analíticas
        </SideBarNavLink>
        <SideBarNavLink href="/dashboard/settings" icon={<FiSettings />}>
          Configuración
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