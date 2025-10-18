"use client";

import clsx from "clsx";
import {Children, ReactNode, cloneElement, isValidElement} from "react";
import {usePathname} from "next/navigation";

export type SideBarNavProps = {
  children: ReactNode;
};

export function SideBarNav({children}: SideBarNavProps) {
  const pathname = usePathname();

  const items = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const href = child.props.href as string | undefined;
    const isActive =
      typeof href === "string" &&
      (pathname === href || pathname.startsWith(`${href}/`));

    return cloneElement(child, {
      className: clsx(
        "dashboard-sidebar__link",
        isActive && "dashboard-sidebar__link--active",
        child.props.className
      ),
      "data-active": isActive ? "true" : undefined,
    });
  });

  return (
    <nav className="dashboard-sidebar__nav">
      <div className="dashboard-sidebar__list">{items}</div>
    </nav>
  );
}
