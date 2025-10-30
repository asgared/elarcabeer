"use client";

import {Container} from "@/components/ui/container";
import {Button} from "@/components/ui/button";
import Link from "next/link";

import {useAnalyticsContext} from "../../providers/analytics-provider";

type BrandHeroProps = {
  content?: {
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    imageUrl?: string | null;
  };
};

export function BrandHero({content}: BrandHeroProps) {
  const analytics = useAnalyticsContext();

  const title = content?.title ?? "Cervezas artesanales inspiradas en travesías náuticas";
  const subtitle = content?.subtitle ?? "Navega el sabor";
  const description =
    content?.body ??
    "Explora estilos premiados, descubre nuestras tabernas marinas y únete al club exclusivo Arca Crew.";

  return (
    <div
      className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-r from-[rgba(12,27,30,0.95)] to-[rgba(19,58,67,0.85)] shadow-card"
      style={
        content?.imageUrl
          ? {
              backgroundImage: `url(${content.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {content?.imageUrl ? <div className="absolute inset-0 bg-[rgba(12,27,30,0.75)]" /> : null}
      <Container className="relative z-10 py-16 md:py-24">
        <div className="space-y-6 md:max-w-[60%]">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">{subtitle}</span>
          <h2 className="font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">{title}</h2>
          <p className="text-lg text-white/80">{description}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              onClick={() => analytics.push({event: "select_promotion", location: "hero_shop"})}
            >
              <Link href="/shop">Explorar catálogo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              onClick={() => analytics.push({event: "select_promotion", location: "hero_loyalty"})}
            >
              <Link href="/loyalty">Unirme al Arca Crew</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
