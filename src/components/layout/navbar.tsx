"use client";

import Link from "next/link";
import {type ReactNode, useEffect, useRef, useState} from "react";
import {FaBars, FaCartShopping, FaChevronDown, FaUser, FaXmark} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {cn} from "@/lib/utils";
import {useUser} from "@/providers/user-provider";
import {products} from "../../data/products";
import {posts} from "../../data/posts";
import {useCartDrawer} from "../../providers/cart-drawer-provider";
import {selectCartCount, useCartStore} from "../../stores/cart-store";

type NavLink = {
  href: string;
  label: string;
};

export function Navbar() {
  const count = useCartStore(selectCartCount);
  const {open} = useCartDrawer();
  const {user, logout} = useUser();
  const [isClient, setIsClient] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"shop" | "discover" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!userMenuRef.current) return;
      if (event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  const shouldShowCartCount = count > 0;

  const shopLinks: NavLink[] = [
    ...products.slice(0, 4).map((product) => ({
      href: `/shop/${product.slug}`,
      label: product.name,
    })),
    {
      href: "/bundles/crew-welcome-pack",
      label: "Bundles destacados",
    },
  ];

  const discoverLinks: NavLink[] = posts.map((post) => ({
    href: `/discover/${post.slug}`,
    label: post.title,
  }));

  return (
    <header className="sticky top-0 z-[1000] bg-[rgba(12,27,30,0.85)] backdrop-blur-md">
      <Container maxW="6xl" className="py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="text-lg font-semibold text-white">
              El Arca
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <DesktopDropdown
                label="Tienda"
                links={shopLinks}
                isOpen={activeMenu === "shop"}
                onOpen={() => setActiveMenu("shop")}
                onClose={() => setActiveMenu((current) => (current === "shop" ? null : current))}
              />
              <Link
                href="/bars"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Bares
              </Link>
              <DesktopDropdown
                label="Descubre"
                links={discoverLinks}
                isOpen={activeMenu === "discover"}
                onOpen={() => setActiveMenu("discover")}
                onClose={() => setActiveMenu((current) => (current === "discover" ? null : current))}
              />
              <Link
                href="/loyalty"
                className="text-sm font-medium text-white/80 transition hover:text-white"
              >
                Lealtad
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                aria-label="Abrir carrito"
                onClick={open}
              >
                <FaCartShopping className="h-5 w-5" />
              </Button>
              {shouldShowCartCount ? (
                <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-black">
                  {count}
                </span>
              ) : null}
            </div>
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition hover:bg-white/10"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                >
                  <UserAvatar name={user.name ?? null} email={user.email ?? null} />
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#14282d] shadow-lg">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name ?? user.email}
                      </p>
                      {user.name ? (
                        <p className="truncate text-xs text-white/60">{user.email}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col py-1">
                      <Link
                        href="/account"
                        className="px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Perfil
                      </Link>
                      <button
                        type="button"
                        className="px-4 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/account"
                aria-label="Cuenta"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              >
                <FaUser className="h-5 w-5" />
              </Link>
            )}
            <button
              type="button"
              aria-label="Menu"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[1100]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex h-full w-full max-w-xs flex-col bg-[#0f2124] p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">El Arca</p>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                aria-label="Cerrar menú"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-4">
              <MobileNavLink href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                Tienda
              </MobileNavLink>
              <MobileNavLink href="/bars" onClick={() => setIsMobileMenuOpen(false)}>
                Bares
              </MobileNavLink>
              <MobileNavLink href="/discover" onClick={() => setIsMobileMenuOpen(false)}>
                Descubre
              </MobileNavLink>
              <MobileNavLink href="/loyalty" onClick={() => setIsMobileMenuOpen(false)}>
                Lealtad
              </MobileNavLink>
              <div className="h-px bg-white/10" />
              <MobileNavLink href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                Cuenta
              </MobileNavLink>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

type DesktopDropdownProps = {
  label: string;
  links: NavLink[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

function DesktopDropdown({label, links, isOpen, onOpen, onClose}: DesktopDropdownProps) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
        onClick={() => (isOpen ? onClose() : onOpen())}
      >
        {label}
        <FaChevronDown
          className={cn("h-3 w-3 transition-transform", isOpen ? "rotate-180" : undefined)}
        />
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#14282d] p-2 shadow-lg">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type MobileNavLinkProps = {
  href: string;
  children: ReactNode;
  onClick?: () => void;
};

function MobileNavLink({href, children, onClick}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-2 py-2 text-left text-base font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}

function UserAvatar({name, email}: {name: string | null; email: string | null}) {
  const initials = getInitials(name, email);

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold uppercase text-black">
      {initials}
    </span>
  );
}

function getInitials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}
