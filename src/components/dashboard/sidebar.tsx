import { ReactNode } from "react";

export type SideBarProps = {
  children: ReactNode;
};

export function SideBar({ children }: SideBarProps) {
  return (
    <aside
      className="dashboard-sidebar"
      style={{
        width: "260px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0
      }}
    >
      {children}
    </aside>
  );
}

export { SideBarNav } from "./sidebar-nav";
