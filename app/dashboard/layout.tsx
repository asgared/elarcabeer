import type {Metadata} from "next";
import {ReactNode} from "react";
import type {IconType} from "react-icons";
import {FaBook, FaBoxOpen, FaGears} from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

export type DashboardNavLink = {
  label: string;
  href: string;
  icon: IconType;
};

export const DASHBOARD_NAV_LINKS: DashboardNavLink[] = [
  {label: "Panel", href: "/dashboard", icon: FaGears},
  {label: "Contenido", href: "/dashboard/content", icon: FaBook},
  {label: "Productos", href: "/dashboard/products", icon: FaBoxOpen},
];

type Props = {
  children: ReactNode;
};

export default function DashboardRootLayout({children}: Props) {
  return children;
}
