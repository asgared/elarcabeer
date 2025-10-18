import {ReactNode} from "react";

export type SideBarProps = {
  children: ReactNode;
};

export function SideBar({children}: SideBarProps) {
  return <aside className="dashboard-sidebar">{children}</aside>;
}

export {SideBarNav} from "./sidebar-nav";
