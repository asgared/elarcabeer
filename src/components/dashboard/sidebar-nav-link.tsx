"use client";
import { Link as ChakraLink, LinkProps, useStyleConfig } from "@chakra-ui/react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = NextLinkProps & LinkProps & {
  children: ReactNode;
  icon?: ReactNode;
};

export function SideBarNavLink({ href, children, icon, ...props }: Props) {
  const pathname = usePathname();
  const styles = useStyleConfig("Link", props);
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <ChakraLink
      as={NextLink}
      href={href}
      className={isActive ? "dashboard-sidebar__link--active" : ""}
      sx={styles}
      {...props}
    >
      {icon}
      {children}
    </ChakraLink>
  );
}