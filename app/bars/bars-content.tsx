"use client";

import NextLink from "next/link";
import {useMemo, useState} from "react";

import {Checkbox} from "@/components/ui/checkbox";
import {Container} from "@/components/ui/container";
import {StoreMap} from "@/components/ui/store-map";
import {stores} from "@/data/stores";
import type {Store} from "@/types/catalog";

export function BarsContent() {
  const [petFriendly, setPetFriendly] = useState(false);
  const [kitchen, setKitchen] = useState(false);
  const [events, setEvents] = useState(false);

  const filtered = useMemo<Store[]>(() => {
    return stores.filter((store) => {
      if (petFriendly && !store.petFriendly) return false;
      if (kitchen && !store.kitchen) return false;
      if (events && !store.events) return false;
      return true;
    });
  }, [petFriendly, kitchen, events]);

  return (
    <Container maxW="6xl">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">Bares & taprooms</h1>
          <p className="text-white/70">
            Navega por nuestros espacios físicos, agenda una reservación y descubre eventos especiales.
          </p>
        </div>
        <StoreMap stores={filtered} />
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <Checkbox
              checked={petFriendly}
              onCheckedChange={(value) => setPetFriendly(Boolean(value))}
            />
            Pet friendly
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <Checkbox checked={kitchen} onCheckedChange={(value) => setKitchen(Boolean(value))} />
            Cocina propia
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <Checkbox checked={events} onCheckedChange={(value) => setEvents(Boolean(value))} />
            Eventos
          </label>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filtered.map((store) => (
            <div
              key={store.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-background/40 p-6"
            >
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-sm text-white/60">{store.address}</p>
              <p className="text-sm text-white/60">{store.hours}</p>
              <div className="flex flex-wrap items-center gap-2">
                {store.petFriendly ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Pet friendly
                  </span>
                ) : null}
                {store.kitchen ? (
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                    Cocina
                  </span>
                ) : null}
                {store.events ? (
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-200">
                    Eventos
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 text-sm text-white/80">
                <span className="font-semibold text-white">Próximos eventos</span>
                {store.upcomingEvents.map((event) => (
                  <span key={event} className="text-white/70">
                    • {event}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-accent">
                {store.menuUrl ? (
                  <a className="hover:underline" href={store.menuUrl} rel="noreferrer" target="_blank">
                    Ver menú
                  </a>
                ) : null}
                <NextLink className="hover:underline" href={`/bars/${store.slug}`}>
                  Reservar
                </NextLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
