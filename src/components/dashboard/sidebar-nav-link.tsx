"use client";
import { Box, Link as ChakraLink, LinkProps, useStyleConfig } from "@chakra-ui/react";
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
      display="flex"
      alignItems="center"
      gap={3}
      px={4}
      py={3}
      mx={2}
      my={1}
      borderRadius="lg"
      fontSize="sm"
      fontWeight={isActive ? "bold" : "medium"}
      color={isActive ? "white" : "whiteAlpha.700"}
      bg={isActive ? "whiteAlpha.200" : "transparent"}
      borderLeft={isActive ? "4px solid" : "4px solid transparent"}
      borderColor={isActive ? "amber.500" : "transparent"}
      transition="all 0.2s"
      _hover={{
        textDecoration: "none",
        color: "white",
        bg: "whiteAlpha.200",
        borderColor: isActive ? "amber.500" : "whiteAlpha.300"
      }}
      {...props}
    >
      {icon && <Box as="span" fontSize="lg" color={isActive ? "amber.500" : "inherit"}>{icon}</Box>}
      {children}
    </ChakraLink>
  );
}