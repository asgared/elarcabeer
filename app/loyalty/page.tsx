import {Container} from "@/components/ui/container";
import {LoyaltyProgress as LoyaltyProgressComponent} from "@/components/ui/loyalty-progress";
import {loyaltyProgress, subscriptionPlans} from "@/data/subscriptions";

export default function LoyaltyPage() {
  return (
    <Container className="max-w-5xl">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">Arca Crew</h1>
          <p className="text-white/70">
            Gana puntos, desbloquea niveles y recibe beneficios exclusivos en cada travesía.
          </p>
        </div>
        <LoyaltyProgressComponent progress={loyaltyProgress} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-background/40 p-6"
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-lg font-bold">
                ${plan.price / 100} MXN / {plan.cadence === "monthly" ? "mes" : "trimestre"}
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
