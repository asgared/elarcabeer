# Supabase Auth

## Cambios implementados
- Dependencias oficiales agregadas (`@supabase/supabase-js` y `@supabase/auth-helpers-nextjs`).
- Clientes compartidos para navegador, componentes server y rutas en `src/lib/supabase/` más helper `requireSupabaseSession`.
- Proveedor global (`SupabaseProvider`) y listener de sesión montados en `AppProviders`, con sincronización contra `/api/auth/callback`.
- Modal y formulario reutilizable (`AuthModal` / `AuthForm`) que permiten registro y login por email/contraseña.
- Navbar actualizado para mostrar el estado de autenticación y permitir cerrar sesión.
- Páginas de cuenta protegidas y nueva vista `/[locale]/auth/sign-in` para flujos directos.
- Healthcheck extendido para validar credenciales y conectividad de Supabase Auth.

## Cómo probar en desarrollo
1. Define las variables en `.env` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Si usarás la base de datos de Supabase, apunta `DATABASE_URL` a la cadena del proyecto y ejecuta `pnpm db:migrate && pnpm db:seed`.
3. Arranca la app con `pnpm dev`, abre `http://localhost:3000` y usa el botón “Iniciar sesión” del navbar o visita `/es/auth/sign-in`.
4. Comprueba que el menú de cuenta muestra el correo autenticado y que `/es/account` requiere sesión.

## Checklist para producción
- Replica todas las variables `SUPABASE_*` (y variantes públicas) en tu proveedor de hosting.
- Configura en Supabase Auth el dominio público como `Site URL` y añade `${SITE_URL}/api/auth/callback` a los redirect.
- Habilita el correo saliente o proveedores OAuth necesarios en Supabase.
- Ejecuta `pnpm db:migrate` apuntando a la base productiva de Supabase antes del despliegue.
- Verifica que el healthcheck (`pnpm health`) pasa en CI/CD para asegurar credenciales válidas.
- Actualiza cualquier integración que dependa de NextAuth, ya que la app ahora usa exclusivamente Supabase Auth.
