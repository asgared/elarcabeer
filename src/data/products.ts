import {Product} from "../types/catalog";

export const products: Product[] = [
  {
    id: "prod-nautilus",
    slug: "nautilus-blonde-ale",
    name: "Nautilus Blonde Ale",
    category: "Core Range",
    style: "Blonde Ale",
    description:
      "Una blonde ale luminosa con notas de miel de azahar y un final crujiente que evoca los amaneceres en alta mar.",
    tastingNotes: ["miel", "cítrico", "crujiente"],
    pairings: ["tostadas de marlin", "ensalada cítrica"],
    ingredients: ["malta pilsner", "lúpulo cascade", "levadura belga", "agua de manantial"],
    rating: 4.6,
    heroImage: "/images/products/nautilus.png",
    gallery: [
      "/images/products/nautilus.png",
      "/images/products/nautilus-detail.jpg"
    ],
    variants: [
      {id: "nautilus-4", name: "4-pack", abv: 4.8, ibu: 18, packSize: 4, price: 2100},
      {id: "nautilus-12", name: "12-pack", abv: 4.8, ibu: 18, packSize: 12, price: 5990}
    ]
  },
  {
    id: "prod-kraken",
    slug: "kraken-ipa",
    name: "Kraken IPA",
    category: "Core Range",
    style: "West Coast IPA",
    description:
      "Intensa, resinosa y tropical, Kraken IPA es un homenaje a los monstruos del océano con un amargor magistral.",
    tastingNotes: ["piña", "resina", "pomelo"],
    pairings: ["tacos de camarón", "curry thai"],
    ingredients: ["malta pale", "lúpulo mosaic", "levadura americana", "agua mineral"],
    rating: 4.8,
    heroImage: "/images/products/kraken.png",
    gallery: [
      "/images/products/kraken.png",
      "/images/products/kraken-detail.jpg"
    ],
    variants: [
      {id: "kraken-4", name: "4-pack", abv: 6.5, ibu: 55, packSize: 4, price: 2400},
      {id: "kraken-12", name: "12-pack", abv: 6.5, ibu: 55, packSize: 12, price: 6800}
    ]
  },
  {
    id: "prod-leviathan",
    slug: "leviathan-imperial-stout",
    name: "Leviathan Imperial Stout",
    category: "Seasonal",
    style: "Imperial Stout",
    description:
      "Un monstruo oscuro con capas de cacao, vainilla y notas de barrica de ron que calientan el espíritu.",
    tastingNotes: ["cacao", "vainilla", "ron"],
    pairings: ["tarta de chocolate", "quesos azules"],
    ingredients: ["malta chocolate", "copos de avena", "ron añejo", "vainilla de papantla"],
    rating: 4.9,
    limitedEdition: true,
    heroImage: "/images/products/leviathan.png",
    gallery: [
      "/images/products/leviathan.png",
      "/images/products/leviathan-detail.jpg"
    ],
    variants: [
      {id: "leviathan-2", name: "2-pack", abv: 10.5, ibu: 65, packSize: 2, price: 1800},
      {id: "leviathan-6", name: "6-pack", abv: 10.5, ibu: 65, packSize: 6, price: 5200}
    ]
  },
  {
    id: "prod-albatross",
    slug: "albatross-pale-ale",
    name: "Albatross Pale Ale",
    category: "Core Range",
    style: "Pale Ale",
    description:
      "Balance perfecto entre maltas doradas y un bouquet cítrico de lúpulos patagónicos.",
    tastingNotes: ["pomelo", "malta caramelo", "pino"],
    pairings: ["pizza margarita", "tostadas de atún"],
    ingredients: ["malta vienna", "lúpulo amarillo", "levadura californiana"],
    rating: 4.3,
    heroImage: "/images/products/albatross.png",
    gallery: [
      "/images/products/albatross.png",
      "/images/products/albatross-detail.jpg"
    ],
    variants: [
      {id: "albatross-4", name: "4-pack", abv: 5.3, ibu: 32, packSize: 4, price: 2200},
      {id: "albatross-24", name: "24-pack", abv: 5.3, ibu: 32, packSize: 24, price: 9900}
    ]
  },
  {
    id: "prod-meridian",
    slug: "meridian-amber-lager",
    name: "Meridian Amber Lager",
    category: "Core Range",
    style: "Amber Lager",
    description:
      "Lager marina ámbar con matices de caramelo y final limpio que recuerda a una brisa salina.",
    tastingNotes: ["caramelo", "pan tostado", "brisa salina"],
    pairings: ["pulpo a las brasas", "tacos al pastor"],
    ingredients: ["malta munich", "lúpulo saaz", "levadura lager"],
    rating: 4.2,
    heroImage: "/images/products/meridian.png",
    gallery: [
      "/images/products/meridian.png"
    ],
    variants: [
      {id: "meridian-6", name: "6-pack", abv: 4.9, ibu: 20, packSize: 6, price: 2100},
      {id: "meridian-24", name: "24-pack", abv: 4.9, ibu: 20, packSize: 24, price: 7800}
    ]
  },
  {
    id: "prod-sirena",
    slug: "sirena-gose",
    name: "Sirena Gose",
    category: "Limited",
    style: "Gose",
    description:
      "Gose refrescante con sal de mar y toques de maracuyá pensada para tardes calurosas.",
    tastingNotes: ["maracuyá", "sal marina", "limón"],
    pairings: ["ceviche", "ostras frescas"],
    ingredients: ["sal de celestún", "maracuyá", "cilantro"],
    rating: 4.5,
    limitedEdition: true,
    heroImage: "/images/products/sirena.png",
    gallery: [
      "/images/products/sirena.png"
    ],
    variants: [
      {id: "sirena-4", name: "4-pack", abv: 4.5, ibu: 10, packSize: 4, price: 2300},
      {id: "sirena-12", name: "12-pack", abv: 4.5, ibu: 10, packSize: 12, price: 6400}
    ]
  },
  {
    id: "prod-triton",
    slug: "triton-tripel",
    name: "Tritón Belgian Tripel",
    category: "Limited",
    style: "Belgian Tripel",
    description:
      "Tripel compleja con especias de cardamomo y piel de naranja, fermentada lentamente.",
    tastingNotes: ["cardamomo", "naranja", "miel"],
    pairings: ["queso gouda", "pollo rostizado"],
    ingredients: ["malta pilsner", "azúcar candi", "levadura trapense"],
    rating: 4.4,
    heroImage: "/images/products/triton.png",
    gallery: [
      "/images/products/triton.png"
    ],
    variants: [
      {id: "triton-750", name: "Botella 750ml", abv: 8.5, ibu: 28, packSize: 1, price: 890},
      {id: "triton-3", name: "Caja de 3", abv: 8.5, ibu: 28, packSize: 3, price: 2400}
    ]
  },
  {
    id: "prod-orion",
    slug: "orion-hazy-ipa",
    name: "Orion Hazy IPA",
    category: "Seasonal",
    style: "Hazy IPA",
    description:
      "IPA turbia con avena y trigo, rebosante de durazno y mango.",
    tastingNotes: ["durazno", "mango", "vainilla"],
    pairings: ["bao de cerdo", "dumplings"],
    ingredients: ["malta trigo", "avena", "lúpulo galaxy"],
    rating: 4.7,
    heroImage: "/images/products/orion.png",
    gallery: [
      "/images/products/orion.png"
    ],
    variants: [
      {id: "orion-4", name: "4-pack", abv: 6.2, ibu: 40, packSize: 4, price: 2500},
      {id: "orion-16", name: "16-pack", abv: 6.2, ibu: 40, packSize: 16, price: 8800}
    ]
  },
  {
    id: "prod-abyss",
    slug: "abyss-porter",
    name: "Abyss Baltic Porter",
    category: "Core Range",
    style: "Baltic Porter",
    description:
      "Porter profunda con notas de cacao y frutas secas que navega entre la dulzura y el tostado.",
    tastingNotes: ["cacao", "ciruela", "melaza"],
    pairings: ["costillas BBQ", "brownies"],
    ingredients: ["malta chocolate", "miel de caña", "lúpulo northern brewer"],
    rating: 4.5,
    heroImage: "/images/products/abyss.png",
    gallery: [
      "/images/products/abyss.png"
    ],
    variants: [
      {id: "abyss-6", name: "6-pack", abv: 7.2, ibu: 35, packSize: 6, price: 2600},
      {id: "abyss-12", name: "12-pack", abv: 7.2, ibu: 35, packSize: 12, price: 7100}
    ]
  },
  {
    id: "prod-marea",
    slug: "marea-sour",
    name: "Marea Roja Sour",
    category: "Seasonal",
    style: "Sour",
    description:
      "Sour fermentada con fresas y flor de jamaica para un rojo vibrante.",
    tastingNotes: ["fresa", "jamaica", "acidez brillante"],
    pairings: ["ensalada de queso de cabra", "tarta de frutos rojos"],
    ingredients: ["fresa", "jamaica", "lúpulo citra"],
    rating: 4.3,
    heroImage: "/images/products/marea.png",
    gallery: [
      "/images/products/marea.png"
    ],
    variants: [
      {id: "marea-4", name: "4-pack", abv: 5.1, ibu: 12, packSize: 4, price: 2350},
      {id: "marea-12", name: "12-pack", abv: 5.1, ibu: 12, packSize: 12, price: 6600}
    ]
  },
  {
    id: "prod-coral",
    slug: "coral-pils",
    name: "Coral Reef Pils",
    category: "Core Range",
    style: "Pilsner",
    description:
      "Pilsner cristalina de cuerpo ligero y final mineral, perfecta para cualquier travesía.",
    tastingNotes: ["limón", "pan blanco", "final seco"],
    pairings: ["tostadas de ceviche", "queso fresco"],
    ingredients: ["malta pilsner", "lúpulo hallertau", "levadura lager"],
    rating: 4.1,
    heroImage: "/images/products/coral.png",
    gallery: [
      "/images/products/coral.png"
    ],
    variants: [
      {id: "coral-6", name: "6-pack", abv: 4.7, ibu: 18, packSize: 6, price: 2050},
      {id: "coral-24", name: "24-pack", abv: 4.7, ibu: 18, packSize: 24, price: 7500}
    ]
  },
  {
    id: "prod-temporal",
    slug: "temporal-barrel-aged",
    name: "Temporal Barrel Aged",
    category: "Limited",
    style: "Barrel Aged Blend",
    description:
      "Blend experimental añejado en barricas de mezcal con notas ahumadas y vainilla.",
    tastingNotes: ["ahumado", "vainilla", "mezcal"],
    pairings: ["mole negro", "costillas glaseadas"],
    ingredients: ["malta chocolate", "mezcal artesanal", "vainilla de papantla"],
    rating: 4.9,
    limitedEdition: true,
    heroImage: "/images/products/temporal.png",
    gallery: [
      "/images/products/temporal.png"
    ],
    variants: [
      {id: "temporal-2", name: "2-pack", abv: 11.5, ibu: 45, packSize: 2, price: 2200},
      {id: "temporal-6", name: "6-pack", abv: 11.5, ibu: 45, packSize: 6, price: 6200}
    ]
  }
];
