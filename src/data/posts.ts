import {ContentPost} from "../types/catalog";

export const posts: ContentPost[] = [
  {
    id: "post-sostenibilidad",
    slug: "sostenibilidad-navegable",
    title: "Una flota más sostenible",
    excerpt: "Cómo El Arca reduce el consumo de agua y apoya a comunidades costeras.",
    body: "El Arca invierte en tecnología de recirculación y alianzas con cooperativas pesqueras...",
    tags: ["sustentabilidad", "comunidad"],
    publishedAt: "2024-01-12",
    heroImage: "/images/blog/sostenibilidad.jpg",
    category: "news"
  },
  {
    id: "post-maridaje",
    slug: "maridaje-kraken",
    title: "Maridajes audaces con Kraken IPA",
    excerpt: "Tres recetas picantes para resaltar el perfil resinoso de nuestra IPA insignia.",
    body: "Experimenta con curry thai, tacos de camarón y alitas con glaseado de tamarindo...",
    tags: ["recetas", "maridaje"],
    publishedAt: "2024-02-05",
    heroImage: "/images/blog/kraken-maridaje.jpg",
    category: "recipe"
  },
  {
    id: "post-escuela",
    slug: "beer-school-fermentacion",
    title: "Beer School: Fermentación Extendida",
    excerpt: "Aprende por qué damos tiempo extra a nuestras fermentaciones y cómo afecta al sabor.",
    body: "La fermentación extendida permite desarrollar ésteres complejos mientras mantenemos el perfil limpio...",
    tags: ["beer school", "educacion"],
    publishedAt: "2024-03-18",
    heroImage: "/images/blog/beer-school.jpg",
    category: "school"
  }
];
