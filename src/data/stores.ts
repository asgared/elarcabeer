import {Store} from "../types/catalog";

export const stores: Store[] = [
  {
    id: "store-roma",
    slug: "cdmx-roma",
    name: "El Arca Roma",
    address: "Colima 123, Roma Norte, CDMX",
    coordinates: [-99.1625, 19.4201],
    petFriendly: true,
    kitchen: true,
    events: true,
    hours: "Lunes a domingo · 13:00 - 01:00",
    menuUrl: "https://elarca.mx/menu/roma.pdf",
    upcomingEvents: ["Cata con el maestro cervecero", "Noches de jazz"]
  },
  {
    id: "store-condesa",
    slug: "cdmx-condesa",
    name: "El Arca Condesa",
    address: "Tamaulipas 77, Condesa, CDMX",
    coordinates: [-99.175, 19.4134],
    petFriendly: true,
    kitchen: false,
    events: true,
    hours: "Martes a domingo · 16:00 - 00:00",
    upcomingEvents: ["Tap takeover internacional", "Trivia náutica"]
  },
  {
    id: "store-coyoacan",
    slug: "cdmx-coyoacan",
    name: "El Arca Coyoacán",
    address: "Higuera 45, Coyoacán, CDMX",
    coordinates: [-99.162, 19.349],
    petFriendly: false,
    kitchen: true,
    events: true,
    hours: "Miércoles a domingo · 14:00 - 23:00",
    menuUrl: "https://elarca.mx/menu/coyoacan.pdf",
    upcomingEvents: ["Taller de maridaje", "Mercado de productores"]
  },
  {
    id: "store-satelite",
    slug: "edomex-satelite",
    name: "El Arca Satélite",
    address: "Circuito novelistas 34, Naucalpan",
    coordinates: [-99.251, 19.5104],
    petFriendly: true,
    kitchen: false,
    events: false,
    hours: "Jueves a domingo · 17:00 - 01:00",
    upcomingEvents: ["DJ sets", "Proyecciones de clásicos"]
  },
  {
    id: "store-polanco",
    slug: "cdmx-polanco",
    name: "El Arca Polanco",
    address: "Presidente Masaryk 250, CDMX",
    coordinates: [-99.198, 19.433],
    petFriendly: false,
    kitchen: true,
    events: true,
    hours: "Lunes a sábado · 12:00 - 00:00",
    menuUrl: "https://elarca.mx/menu/polanco.pdf",
    upcomingEvents: ["Brunch marinero", "Sesiones de vinyl"]
  }
];
