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
import { SideBarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { requireDashboardAccess } from "@/lib/auth/get-user-capabilities";
import { getAdminSession } from "@/lib/auth/admin";
import { getVisibleNav, type NavSection } from "@/lib/dashboard/nav-items";

// Icon registry — maps href to the react-icon component
const ICONS: Record<string, ReactNode> = {
  "/dashboard": <FiGrid />,
  "/dashboard/content": <FiFileText />,
  "/dashboard/products": <FiPackage />,
  "/dashboard/categories": <FiTag />,
  "/dashboard/orders": <FiShoppingCart />,
  "/dashboard/customers": <FiUsers />,
  "/dashboard/loyalty": <FiStar />,
  "/dashboard/stores": <FiMapPin />,
  "/dashboard/analytics": <FiBarChart2 />,
  "/dashboard/settings": <FiSettings />,
};

type Props = {
  children: ReactNode;
};

export default async function DashboardAdminLayout({ children }: Props) {
  // ── Server-side gate: redirect if user lacks dashboard:access ──
  const capabilities = await requireDashboardAccess();

  const session = await getAdminSession();
  const user = session?.user;

  if (!user) {
    // requireDashboardAccess already redirects, but guard for type safety
    return null;
  }

  // ── Build capability-filtered sidebar ──
  const visibleNav = getVisibleNav(capabilities);

  const sidebar = (
    <SideBar>
      <SideBarNav>
        {visibleNav.map((section: NavSection, i: number) => (
          <div key={i}>
            {section.title && (
              <>
                <Box py={2} />
                <Text
                  px={4}
                  fontSize="xs"
                  fontWeight="bold"
                  color="whiteAlpha.400"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {section.title}
                </Text>
              </>
            )}
            {section.items.map((item) => (
              <SideBarNavLink
                key={item.href}
                href={item.href}
                icon={ICONS[item.href]}
              >
                {item.label}
              </SideBarNavLink>
            ))}
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