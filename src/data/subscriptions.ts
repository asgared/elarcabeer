import {GiftCard, LoyaltyProgress, SubscriptionPlan} from "../types/catalog";

export const loyaltyProgress: LoyaltyProgress = {
  tier: "Navigator",
  points: 1850,
  nextTierPoints: 2500
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "club-sailor",
    name: "Sailor",
    price: 6900,
    cadence: "monthly",
    perks: ["6 cervezas seleccionadas", "Acceso anticipado a lanzamientos"]
  },
  {
    id: "club-navigator",
    name: "Navigator",
    price: 11900,
    cadence: "monthly",
    perks: ["12 cervezas", "Meet & greet digital con el maestro cervecero"]
  },
  {
    id: "club-captain",
    name: "Captain",
    price: 18900,
    cadence: "quarterly",
    perks: ["Selecciones en barrica", "Merch exclusivo", "Eventos privados"]
  }
];

export const giftCards: GiftCard[] = [
  {id: "gift-500", amount: 50000, description: "Para obsequios espontáneos"},
  {id: "gift-1000", amount: 100000, description: "Celebra en grande"},
  {id: "gift-2000", amount: 200000, description: "Experiencia completa del Arca"}
];
