"use client";

import Image from "next/image";
import Link from "next/link";
import type {LucideIcon} from "lucide-react";
import {MessageCircle, Music2} from "lucide-react";

import {Facebook, Instagram} from "@/lib/brand-icons";

import type {SocialLink as CmsSocialLink} from "@/types/cms";

const navigationLinks = [
  {href: "/shop", label: "Cervezas"},
  {href: "/bundles", label: "Bundles"},
  {href: "/discover", label: "Descubre"},
  {href: "/loyalty", label: "Loyalty"},
  {href: "/bars", label: "Bares"},
];

const legalLinks = [
  {href: "/legal/privacy", label: "Aviso de privacidad"},
  {href: "/legal/terms", label: "Términos y condiciones"},
  {href: "/legal/shipping", label: "Envíos"},
];

const defaultSocialLinks = [
  {href: "https://www.instagram.com/elarcabeer", label: "Instagram", icon: Instagram},
  {href: "https://www.facebook.com/elarcabeer", label: "Facebook", icon: Facebook},
  {href: "https://www.tiktok.com/@elarcabeer", label: "TikTok", icon: Music2},
  {href: "https://wa.me/521234567890", label: "WhatsApp", icon: MessageCircle},
];

type FooterProps = {
  subtitle?: string | null;
  socialLinks?: CmsSocialLink[] | null;
};

type SocialLink = {
  href: string;
  label: string;
  icon: LucideIcon | null;
};

const iconMap: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

function resolveSocialLinks(links?: CmsSocialLink[] | null): SocialLink[] {
  if (!links || links.length === 0) {
    return defaultSocialLinks;
  }

  return links.map((link) => {
    const key = link.platform.trim().toLowerCase();
    const icon = iconMap[key] ?? null;

    return {
      href: link.url,
      label: link.platform,
      icon,
    };
  });
}

export function Footer({subtitle, socialLinks}: FooterProps) {
  const resolvedSocialLinks = resolveSocialLinks(socialLinks);

  return (
    <footer className="border-t border-border/40 bg-muted/40 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="h-10 w-32">
              <Image
                src="/logos/arca_logo_complete.svg"
                alt="El Arca Cervecería"
                width={128}
                height={40}
                className="h-full w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} El Arca Cervecería. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              {subtitle ?? "Cervezas artesanales inspiradas en travesías marítimas."}
            </p>
            <Image
              src="/logos/beer_glasses.svg"
              alt="Beermoji"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="text-base font-semibold text-foreground">Navegación</p>
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="text-base font-semibold text-foreground">Legal</p>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-border/40 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-muted-foreground">EVITA EL EXCESO</p>
          <div className="flex items-center gap-4">
            {resolvedSocialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-medium">{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
