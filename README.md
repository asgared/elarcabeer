# El Arca Brew Experience

Experiencia eCommerce inspirada en brewdog.com pero con identidad náutica de **El Arca**. El proyecto usa Next.js 14 (App Router), Chakra UI con theme personalizado y Prisma como ORM para Postgres (SQLite en desarrollo).

## Arquitectura

- **Front-end**: Next.js App Router + TypeScript + Chakra UI.
- **State management**: Zustand (carrito persistente con localStorage y sincronización preparada para server).
- **Internacionalización**: next-intl con `es-MX` y `en-US`.
- **Pagos y suscripciones**: endpoints stub preparados para Stripe (checkout, billing, webhooks).
- **Contenido dinámico**: páginas Shop, PDP, Bundles, Bars con mapa Mapbox, Discover/blog, Loyalty y Account.
- **Analytics**: hook `useAnalytics` que envía eventos a `window.dataLayer` y carga Vercel Analytics.
- **SEO**: next-seo + sitemap automático.
- **Base de datos**: Prisma con modelos para catálogo, órdenes, usuarios, lealtad y contenido. Seed incluido con 12 cervezas, bundles y 5 bares CDMX.

## Setup rápido

1. Copia `.env.example` a `.env` y define credenciales:

```bash
cp .env.example .env
```

2. Instala dependencias con pnpm:

```bash
pnpm install
```

3. Genera el cliente de Prisma y corre migraciones (para desarrollo puedes usar SQLite con `DATABASE_PROVIDER=sqlite` y `DATABASE_URL="file:./dev.db"`):

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4. Inicia el servidor local:

```bash
pnpm dev
```

## Scripts disponibles

- `pnpm dev`: servidor de desarrollo en `http://localhost:3000`.
- `pnpm build`: build de producción.
- `pnpm start`: servidor de producción.
- `pnpm lint`: linting con ESLint.
- `pnpm typecheck`: verificación TypeScript.
- `pnpm db:migrate`: ejecuta migraciones en la base configurada.
- `pnpm db:seed`: carga datos de ejemplo (cervezas, bundles, bares, posts).

## Datos seed incluidos

- 12 productos (Nautilus Blonde Ale, Kraken IPA, Leviathan Imperial Stout, etc.).
- 3 bundles destacados.
- 5 bares en CDMX con coordenadas para Mapbox.
- Entradas Discover/Blog.
- Planes de lealtad y gift cards.

## Integraciones

- **Stripe**: endpoints `/api/checkout/session`, `/api/checkout/subscription`, `/api/webhooks/stripe`.
- **Mapbox GL JS**: componente `StoreMap`, requiere `NEXT_PUBLIC_MAPBOX_TOKEN`.
- **Calendly**: iframe embed en ficha de bar.
- **Resend**: preparado para emails transaccionales.

## QA & pruebas

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Incluye base para pruebas e2e con Playwright (`npx playwright test`) y hooks de analytics para eventos GA4.
