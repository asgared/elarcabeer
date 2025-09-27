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

## Variables de entorno

| Variable | Descripción | Cómo obtenerla |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión para Postgres (prod) o SQLite (dev) | Consola de tu proveedor o `file:./dev.db` para SQLite |
| `DATABASE_PROVIDER` | Tipo de base de datos que usa Prisma (`postgresql` o `sqlite`) | Define manualmente según tu entorno |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe para crear sesiones de pago | [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave pública usada en el frontend de Stripe | Mismo panel de Stripe (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint webhook configurado | `stripe listen --forward-to` o Dashboard → Webhooks (`whsec_...`) |
| `MAPBOX_TOKEN` | Token público para Mapbox GL | [Cuenta Mapbox → Access tokens](https://account.mapbox.com/) (`pk....`) |
| `RESEND_API_KEY` | Llave para envío de emails transaccionales | [Resend Dashboard](https://resend.com/) (`re_...`) |
| `CLOUDINARY_URL` | Cadena de conexión para subir activos a Cloudinary | [Cloudinary Console → Programmable Media](https://console.cloudinary.com/) |
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase para llamadas server/client | [Supabase → Project settings → API](https://supabase.com/dashboard/project/_/settings/api) |
| `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública para clientes Supabase | Mismo panel de Supabase (`anon` key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave de servicio (solo uso server) para tareas privilegiadas | Panel Supabase (`service_role` key) |

## Supabase Auth

1. Crea un proyecto en [Supabase](https://supabase.com/) y copia las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (además de sus equivalentes `NEXT_PUBLIC_*`).
2. En la sección **Authentication → URL configuration** define `http://localhost:3000` como `Site URL` en desarrollo y añade `http://localhost:3000/api/auth/callback` en **Redirect URLs** (usa tus dominios reales en staging/producción).
3. Apunta `DATABASE_URL` al Postgres gestionado por Supabase y ejecuta las migraciones y seed: `pnpm db:migrate && pnpm db:seed`.
4. Actualiza las políticas de correo saliente si usarás el flujo de confirmación de email (`Authentication → Providers → Email`).
5. En despliegues (p. ej. Vercel) replica todas las variables (`SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `DATABASE_URL`) y añade el dominio público en la configuración de Supabase para que los enlaces mágicos funcionen.

## Healthcheck y utilidades

- `pnpm health`: ejecuta las comprobaciones de base de datos, Stripe, Supabase Auth y servicios externos.
- Endpoints JSON disponibles en `/api/health` y `/admin/health`.

## Scripts disponibles

- `pnpm dev`: servidor de desarrollo en `http://localhost:3000`.
- `pnpm build`: build de producción.
- `pnpm start`: servidor de producción.
- `pnpm lint`: linting con ESLint.
- `pnpm typecheck`: verificación TypeScript.
- `pnpm health`: comprobaciones de dependencias externas.
- `pnpm test`: pruebas E2E con Playwright (flujo Checkout, actualmente marcado como pendiente).
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
- **Supabase Auth**: login con email/contraseña, listeners en App Router y `/api/auth/callback` para sincronizar cookies.
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
