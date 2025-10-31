"use client";

import Image from "next/image";
import Link from "next/link";
import {useEffect, useState} from "react";
import {Moon, ShoppingBag, Sun, User} from "lucide-react";
import {useTheme} from "next-themes";

import {Button} from "@/components/ui/button";
import {useCartDrawer} from "@/providers/cart-drawer-provider";

const links = [
  {href: "/shop", label: "Cervezas"},
  {href: "/bundles", label: "Bundles"},
  {href: "/discover", label: "Descubre"},
  {href: "/loyalty", label: "Loyalty"},
  {href: "/bars", label: "Bares"},
];

type NavLinkProps = {
  href: string;
  label: string;
};

export function Navbar() {
  const {open} = useCartDrawer();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="hidden h-10 w-10 md:inline-flex">
            <Image
              src="/logos/arca_logo.svg"
              alt="Logo El Arca"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </span>
          <span className="h-8 w-24">
            <Image
              src="/logos/arca_logo_complete.svg"
              alt="El Arca"
              width={96}
              height={32}
              className="h-8 w-24"
              priority
            />
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Abrir carrito"
            onClick={open}
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>

          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/account" aria-label="Cuenta de usuario">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function NavLink({href, label}: NavLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

type Theme = "light" | "dark";

function ThemeToggle() {
  const {resolvedTheme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme as Theme | undefined) === "dark";
  const Icon = !mounted || !isDark ? Moon : Sun;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label="Cambiar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}

export default Navbar;
