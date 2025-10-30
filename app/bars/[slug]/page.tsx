import {Metadata} from "next";
import {notFound} from "next/navigation";

import {Container} from "@/components/ui/container";
import {stores} from "@/data/stores";
import type {Store} from "@/types/catalog";

const getStore = (slug: string): Store | undefined =>
  stores.find((store) => store.slug === slug);

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const store = getStore(params.slug);

  if (!store) {
    return {title: "Bar no encontrado"};
  }

  return {
    title: store.name,
    description: store.address
  };
}

export default function StorePage({params}: {params: {slug: string}}) {
  const store = getStore(params.slug);

  if (!store) {
    notFound();
  }

  return (
    <Container maxW="4xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">{store.name}</h1>
          <p className="text-white/70">{store.address}</p>
          <p className="text-white/70">{store.hours}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            allowFullScreen
            className="h-[480px] w-full"
            src="https://calendly.com/elarca/visit?hide_gdpr_banner=1"
            style={{border: "none"}}
            title="Reservar mesa"
          />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Próximos eventos</h2>
          {store.upcomingEvents.map((event) => (
            <p key={event} className="text-white/80">
              • {event}
            </p>
          ))}
        </div>
      </div>
    </Container>
  );
}
