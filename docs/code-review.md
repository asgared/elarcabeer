# Revisión de código - rama `develop`

## Internacionalización e identidad de marca
- El layout raíz fija `lang="es"`, por lo que los documentos renderizados en `en` siguen exponiéndose como español. Conviene mover el atributo `lang` al layout localizado o derivarlo de `params.locale` para mejorar accesibilidad y SEO.【F:app/layout.tsx†L21-L27】
- El layout localizado invoca `getTranslations(locale);` sin usar su resultado. Esto sugiere que la intención era establecer el locale en la request (por ejemplo con `unstable_setRequestLocale`) o precargar traducciones específicas; hoy es un efecto nulo que puede eliminarse o reemplazarse por la llamada correcta.【F:app/[locale]/layout.tsx†L37-L44】
- La página de inicio y varios componentes de UI contienen textos en español embebidos directamente, por lo que el cambio de idioma no tiene impacto real. Sería recomendable sustituir los literales por `useTranslations` y mensajes en los archivos de `src/messages` para lograr una experiencia realmente bilingüe.【F:app/[locale]/page.tsx†L15-L60】【F:src/components/ui/brand-hero.tsx†L12-L45】【F:src/components/ui/loyalty-progress.tsx†L14-L22】
- El archivo de mensajes en español tiene errores tipográficos ("Tiendas", "Descúbre") que afectan la calidad percibida del contenido localizado; conviene corregirlos durante la estandarización de traducciones.【F:src/messages/es.json†L2-L12】

## Resiliencia en renderizado y SSR
- El store de carrito persiste en `localStorage`, pero `createJSONStorage(() => localStorage)` se evalúa al cargar el módulo. En entornos SSR esto provoca `ReferenceError` porque `localStorage` no existe. Se sugiere proteger el acceso (`typeof window !== "undefined"`) o utilizar el helper de Zustand recomendado para Next.js (`persist` con `createJSONStorage(() => sessionStorage)` dentro de `if`).【F:src/stores/cart-store.ts†L22-L70】
- Los proveedores de Chakra insertan `ColorModeScript` dentro del `<body>`, pero la librería aconseja montarlo en el `<head>` para evitar el flash de color inicial. Consideren moverlo a `app/layout.tsx` con `ColorModeScript` dentro del `head` o usar el componente `ColorModeProvider` adecuado en App Router.【F:src/providers/app-providers.tsx†L4-L26】

## Rendimiento y experiencia de usuario
- `CartDrawer` lee todo el estado del store con `useCartStore()` y recalcula `products.find` en cada render. Esto fuerza re-renderizados completos ante cualquier cambio del carrito. Podrían usarse selectores (`useCartStore((state) => state.items)`) y memorizar el catálogo por id para evitar búsquedas repetidas.【F:src/components/cart/cart-drawer.tsx†L24-L82】
- En `Navbar`, la insignia del contador de carrito depende del total global, pero el botón que la abre no anuncia el número a lectores de pantalla porque el texto accesible permanece estático. Añadir `aria-label` dinámico o `aria-live` mejoraría la accesibilidad del flujo de compra.【F:src/components/layout/navbar.tsx†L66-L106】

## Observaciones menores
- El middleware de `next-intl` mezcla comillas simples y dobles y deja comentarios inline en inglés/español con espacios extra; conviene uniformar estilo y mover el comentario a una línea separada para mantener consistencia.【F:middleware.ts†L1-L12】
- Documentación y mensajes de analytics: sería útil añadir eventos inversos (p. ej., `view_cart`, `remove_from_cart`) para completar el funnel, aprovechando que ya existe `AnalyticsProvider` con `push` centralizado.【F:src/providers/analytics-provider.tsx†L17-L35】【F:src/components/cart/cart-drawer.tsx†L24-L82】
