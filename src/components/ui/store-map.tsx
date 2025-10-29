"use client";

import {useMemo} from "react";

import type {Store} from "../../types/catalog";

type Props = {
  stores: Store[];
};

type Projection = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

function calculateProjection(stores: Store[]): Projection | null {
  if (stores.length === 0) {
    return null;
  }

  const lngs = stores.map((store) => store.coordinates[0]);
  const lats = stores.map((store) => store.coordinates[1]);

  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
}

function projectCoordinate([lng, lat]: Store["coordinates"], projection: Projection) {
  const {minLng, maxLng, minLat, maxLat} = projection;
  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;

  const x = ((lng - minLng) / lngRange) * 100;
  const y = (1 - (lat - minLat) / latRange) * 100;

  return {x, y};
}

export function StoreMap({stores}: Props) {
  const projection = useMemo(() => calculateProjection(stores), [stores]);

  if (!projection) {
    return (
      <div className="rounded-3xl border border-white/10 p-8 text-center">
        <p className="text-white/70">No hay bares para mostrar en el mapa.</p>
      </div>
    );
  }

  return (
    <div
      className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 md:h-[480px]"
      style={{
        backgroundImage: "linear-gradient(to bottom right, rgba(19,58,67,0.85), rgba(12,27,30,0.95))",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(53,163,179,0.15) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      {stores.map((store) => {
        const {x, y} = projectCoordinate(store.coordinates, projection);

        return (
          <div
            key={store.id}
            aria-label={store.name}
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C6A15B] shadow-[0_0_0_2px_#0C1B1E,0_0_12px_rgba(198,161,91,0.6)]"
            style={{left: `${x}%`, top: `${y}%`}}
            title={store.name}
          >
            <span className="absolute inset-[-12px] rounded-full bg-[rgba(198,161,91,0.12)]" />
          </div>
        );
      })}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 text-right">
        <p className="text-sm text-white/70">Mapa ilustrativo generado sin dependencias externas.</p>
      </div>
    </div>
  );
}
