import { Home, Package, ShoppingCart, Users } from "lucide-react";
import { SideBar, SideBarNav } from "@/components/admin/sidebar";
import { SideBarNavLink } from "@/components/admin/sidebar-nav-link";

export function DashboardSidebar() {
  return (
    <SideBar>
      <div className="flex h-full flex-1 flex-col gap-4">
        {/* Este div wrapper asegura que la navegación ocupe el espacio disponible */}
        <SideBarNav>
          <SideBarNavLink href="/dashboard" icon={<Home />}>
            Inicio
          </SideBarNavLink>
          <SideBarNavLink href="/dashboard/products" icon={<Package />}>
            Productos
          </SideBarNavLink>
          <SideBarNavLink href="/dashboard/orders" icon={<ShoppingCart />}>
            Órdenes
          </SideBarNavLink>
          <SideBarNavLink href="/dashboard/users" icon={<Users />}>
            Clientes
          </SideBarNavLink>
          {/* Añadir futuros enlaces aquí */}
        </SideBarNav>
      </div>
    </SideBar>
  );
}
