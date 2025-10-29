"use client";

import {LoyaltyProgress as LoyaltyProgressType} from "../../types/catalog";

type Props = {
  progress: LoyaltyProgressType;
};

export function LoyaltyProgress({progress}: Props) {
  const percentage = Math.min(100, Math.round((progress.points / progress.nextTierPoints) * 100));

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgba(19,58,67,0.65)] p-8 shadow-soft">
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Tu travesía como {progress.tier}</h3>
        <p className="text-sm text-white/70">
          Has acumulado {progress.points} puntos. ¡Estás a {progress.nextTierPoints - progress.points} de alcanzar el
          siguiente rango!
        </p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal-400 transition-[width] duration-300"
            style={{width: `${percentage}%`}}
          />
        </div>
      </div>
    </div>
  );
}
