import {Bundle} from "../types/catalog";

export const bundles: Bundle[] = [
  {
    id: "bundle-explorer",
    slug: "explorer-mixed-pack",
    name: "Explorer Mixed Pack",
    description: "Un viaje por los estilos más vendidos de El Arca con notas náuticas y tropicales.",
    products: [
      {productId: "prod-nautilus", quantity: 2},
      {productId: "prod-kraken", quantity: 2},
      {productId: "prod-meridian", quantity: 2}
    ],
    price: 5900,
    savingsPercentage: 12,
    image: "/images/bundles/explorer.png"
  },
  {
    id: "bundle-dark-treasures",
    slug: "dark-treasures",
    name: "Dark Treasures",
    description: "Selección oscura para noches de tormenta con Leviathan, Abyss y Temporal.",
    products: [
      {productId: "prod-leviathan", quantity: 2},
      {productId: "prod-abyss", quantity: 4},
      {productId: "prod-temporal", quantity: 2}
    ],
    price: 8600,
    savingsPercentage: 15,
    image: "/images/bundles/dark_treasures.png"
  },
  {
    id: "bundle-crew",
    slug: "crew-welcome-pack",
    name: "Crew Welcome Pack",
    description: "Ideal para nuevos miembros del Arca Crew con lagers refrescantes y hazy IPA.",
    products: [
      {productId: "prod-coral", quantity: 6},
      {productId: "prod-orion", quantity: 4},
      {productId: "prod-nautilus", quantity: 6}
    ],
    price: 7200,
    savingsPercentage: 10,
    image: "/images/bundles/crew.png"
  }
];
