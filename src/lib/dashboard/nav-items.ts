import type { ReactNode } from "react";
import type { Capability } from "@/lib/auth/permissions";

// ─── Nav Item Definitions ──────────────────────────────────────────────────

export type NavItem = {
    href: string;
    label: string;
    /** Capability required to see this link. */
    capability: Capability | null; // null = always visible (e.g. dashboard overview)
};

export type NavSection = {
    title: string;
    items: NavItem[];
};

/**
 * All dashboard navigation sections. Each item declares the capability
 * required to render it. The sidebar builder filters out items the
 * current user cannot access.
 */
export const NAV_SECTIONS: NavSection[] = [
    {
        title: "",
        items: [
            { href: "/dashboard", label: "Resumen", capability: null },
        ],
    },
    {
        title: "Contenido",
        items: [
            { href: "/dashboard/content", label: "Secciones CMS", capability: "content:read" },
            { href: "/dashboard/products", label: "Productos", capability: "content:read" },
            { href: "/dashboard/categories", label: "Categorías", capability: "categories:read" },
        ],
    },
    {
        title: "Ventas",
        items: [
            { href: "/dashboard/orders", label: "Órdenes", capability: "orders:read" },
            { href: "/dashboard/customers", label: "Clientes", capability: "users:read" },
            { href: "/dashboard/loyalty", label: "Lealtad", capability: "loyalty:manage" },
        ],
    },
    {
        title: "Sistema",
        items: [
            { href: "/dashboard/stores", label: "Tiendas", capability: "stores:manage" },
            { href: "/dashboard/analytics", label: "Analíticas", capability: "analytics:read" },
            { href: "/dashboard/settings", label: "Configuración", capability: "settings:manage" },
        ],
    },
];

/**
 * Filter nav sections to only include items the user's capabilities allow.
 * Sections with no visible items are dropped entirely.
 */
export function getVisibleNav(
    capabilities: Set<Capability>,
): NavSection[] {
    return NAV_SECTIONS
        .map((section) => ({
            ...section,
            items: section.items.filter(
                (item) => item.capability === null || capabilities.has(item.capability),
            ),
        }))
        .filter((section) => section.items.length > 0);
}
