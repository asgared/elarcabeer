"use client";

import Link, {type LinkProps} from "next/link";
import {usePathname} from "next/navigation";
import {type AnchorHTMLAttributes, type ReactNode} from "react";

import {cn} from "@/lib/utils";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    icon?: ReactNode;
  };

export function SideBarNavLink({href, children, icon, className, ...props}: Props) {
  const pathname = usePathname();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";
  const isActive = pathname === hrefString || pathname.startsWith(`${hrefString}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition",
        "hover:bg-muted/60 hover:text-foreground",
        isActive && "bg-muted text-foreground shadow-soft",
        className
      )}
      {...props}
    >
      {icon ? <span className="text-lg">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </Link>
  );
}
