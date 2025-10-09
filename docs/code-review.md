# Revisión de código - rama `develop`

## Contenido e identidad de marca
- El layout raíz fija `lang="es"`, consistente con la decisión de servir únicamente una experiencia en español. Si en el futuro se reintroduce un segundo idioma, será necesario volver a delegar el atributo `lang` en el layout correspondiente para respetar la accesibilidad y el SEO.【F:app/layout.tsx†L21-L27】
- Al haberse retirado `next-intl`, todos los textos viven como literales en los componentes. Documentar las frases clave o centralizarlas en un módulo propio facilitaría mantener un tono consistente cuando crezca el catálogo de páginas.【F:app/page.tsx†L1-L60】【F:src/components/ui/brand-hero.tsx†L12-L45】

## Resiliencia en renderizado y SSR
- El store de carrito persiste en `localStorage`, pero `createJSONStorage(() => localStorage)` se evalúa al cargar el módulo. En entornos SSR esto provoca `ReferenceError` porque `localStorage` no existe. Se sugiere proteger el acceso (`typeof window !== "undefined"`) o utilizar el helper de Zustand recomendado para Next.js (`persist` con `createJSONStorage(() => sessionStorage)` dentro de `if`).【F:src/stores/cart-store.ts†L22-L70】
- Los proveedores de Chakra insertan `ColorModeScript` dentro del `<body>`, pero la librería aconseja montarlo en el `<head>` para evitar el flash de color inicial. Consideren moverlo a `app/layout.tsx` con `ColorModeScript` dentro del `head` o usar el componente `ColorModeProvider` adecuado en App Router.【F:src/providers/app-providers.tsx†L4-L26】

## Rendimiento y experiencia de usuario
- `CartDrawer` lee todo el estado del store con `useCartStore()` y recalcula `products.find` en cada render. Esto fuerza re-renderizados completos ante cualquier cambio del carrito. Podrían usarse selectores (`useCartStore((state) => state.items)`) y memorizar el catálogo por id para evitar búsquedas repetidas.【F:src/components/cart/cart-drawer.tsx†L24-L82】
- En `Navbar`, la insignia del contador de carrito depende del total global, pero el botón que la abre no anuncia el número a lectores de pantalla porque el texto accesible permanece estático. Añadir `aria-label` dinámico o `aria-live` mejoraría la accesibilidad del flujo de compra.【F:src/components/layout/navbar.tsx†L66-L106】

## Observaciones menores
- El middleware de `next-intl` mezcla comillas simples y dobles y deja comentarios inline en inglés/español con espacios extra; conviene uniformar estilo y mover el comentario a una línea separada para mantener consistencia.【F:middleware.ts†L1-L12】
- Documentación y mensajes de analytics: sería útil añadir eventos inversos (p. ej., `view_cart`, `remove_from_cart`) para completar el funnel, aprovechando que ya existe `AnalyticsProvider` con `push` centralizado.【F:src/providers/analytics-provider.tsx†L17-L35】【F:src/components/cart/cart-drawer.tsx†L24-L82】
