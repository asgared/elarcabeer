"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import {Container} from "@/components/ui/container";
import type {SocialLink} from "@/types/cms";

type FooterProps = {
  subtitle?: string | null;
  socialLinks?: SocialLink[];
};

function resolveIcon(platform: string): LucideIcon | null {
  const normalized = platform.toLowerCase();

  const mapping: {match: RegExp; icon: LucideIcon}[] = [
    {match: /insta/, icon: Instagram},
    {match: /face/, icon: Facebook},
    {match: /tiktok/, icon: Music2},
    {match: /youtube/, icon: Youtube},
    {match: /twitter|\bx\b/, icon: Twitter},
  ];

  const resolved = mapping.find(({match}) => match.test(normalized));
  if (resolved) {
    return resolved.icon;
  }

  return null;
}

export function Footer({subtitle, socialLinks = []}: FooterProps) {
  return (
    <footer className="mt-16 border-t border-white/10 py-12">
      <Container className="w-full max-w-6xl">
        <div className="flex w-full flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="flex max-w-md flex-col gap-2">
            <p className="text-lg font-semibold">El Arca Cervecería</p>
            <p className="text-sm text-white/60">
              {subtitle ?? "Cervezas artesanales desde 2015"}
            </p>
            {socialLinks.length ? (
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((link) => {
                  const IconComponent = resolveIcon(link.platform);

                  return (
                    <Link
                      key={`${link.platform}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-[2rem] items-center gap-2 text-sm text-white/70 transition hover:text-white"
                    >
                      {IconComponent ? <IconComponent className="h-4 w-4" /> : null}
                      <span>{link.platform}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:gap-6 md:flex-row md:items-end md:text-right">
            <Link className="transition hover:text-white" href="/legal/privacy">
              Privacidad
            </Link>
            <Link className="transition hover:text-white" href="/legal/terms">
              Términos
            </Link>
            <Link className="transition hover:text-white" href="/legal/shipping">
              Envíos
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
