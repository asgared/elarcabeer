import { Home, Package, ShoppingCart, Users, FileText, Newspaper, Store } from "lucide-react";
import { SideBar, SideBarNav } from "@/components/dashboard/sidebar";
import { SideBarNavLink } from "@/components/dashboard/sidebar-nav-link";

export function DashboardSidebar() {
  return (
    <SideBar>
      <div className="flex h-full flex-1 flex-col gap-4">
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
          <SideBarNavLink href="/dashboard/content" icon={<FileText />}>
            Contenido
          </SideBarNavLink>
          <SideBarNavLink href="/dashboard/blog" icon={<Newspaper />}>
            Blog
          </SideBarNavLink>
          <SideBarNavLink href="/dashboard/stores" icon={<Store />}>
            Tiendas
          </SideBarNavLink>
        </SideBarNav>
      </div>
    </SideBar>
  );
}
