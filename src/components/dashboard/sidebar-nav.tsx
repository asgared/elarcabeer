import { ReactNode } from "react";
export type SideBarNavProps = {
  children: ReactNode;
};
export function SideBarNav({ children }: SideBarNavProps) {
  return (
    <nav className="dashboard-sidebar__nav">
      <div className="dashboard-sidebar__list">{children}</div>
    </nav>
  );
}