import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SideBarProps = { children: ReactNode; className?: string };

export function SideBar({ children, className }: SideBarProps) {
  return (
    <aside
      className={cn(
        "dashboard-sidebar",
        // Clases de Layout:
        "hidden h-screen w-72 flex-col border-r border-white/10 bg-background md:flex",
        // Clases de Posicionamiento:
        "sticky top-0",
        // Clases de Scroll:
        "overflow-y-auto",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export { SideBarNav } from "./sidebar-nav";
