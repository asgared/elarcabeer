# RBAC Setup Guide

## Overview

The project uses a **Role-Based Access Control (RBAC)** system:

| Table | Purpose |
|-------|---------|
| `Role` | Stores role definitions (e.g. `superadmin`, `content_editor`) |
| `user_roles` | Join table linking users to roles (many-to-many) |

Roles are **never auto-assigned**. New users start with zero roles. The `superadmin` role must be assigned manually.

---

## 1. Run the Migration

```bash
# Generate the migration (first time only)
pnpm prisma migrate dev --name add-rbac-tables

# In production / staging
pnpm prisma migrate deploy
```

## 2. Seed Base Roles

```bash
pnpm db:seed
```

This inserts 4 base roles via `upsert` (safe to re-run):

| Key | Name |
|-----|------|
| `superadmin` | Super Administrador |
| `content_editor` | Editor de Contenido |
| `viewer` | Visor |
| `user_admin` | Administrador de Usuarios |

> [!WARNING]
> The seed script is blocked in production (`NODE_ENV=production`). For staging, set `ALLOW_SEED_ON_REMOTE=true`.

## 3. Assign Superadmin Manually

### Step 1 — Get the user's ID from Supabase

1. Go to **Supabase Dashboard → Authentication → Users**
2. Find the user you want to make superadmin
3. Copy their **User UID** (UUID format, e.g. `a1b2c3d4-...`)

### Step 2 — Get the Role ID

Run in **Supabase SQL Editor**:

```sql
SELECT id FROM public."Role" WHERE key = 'superadmin';
```

### Step 3 — Insert into user_roles

```sql
INSERT INTO public.user_roles (user_id, role_id, "createdAt")
VALUES (
  '<USER_UUID>',           -- from Step 1
  '<ROLE_ID>',             -- from Step 2
  NOW()
);
```

### Alternative — Single query (recommended)

```sql
INSERT INTO public.user_roles (user_id, role_id, "createdAt")
SELECT
  '<USER_UUID>',
  r.id,
  NOW()
FROM public."Role" r
WHERE r.key = 'superadmin';
```

## 4. Apply RLS Policies

Run the contents of [`supabase/rls_roles.sql`](../supabase/rls_roles.sql) in the **Supabase SQL Editor**.

This enables:
- ✅ Authenticated users can `SELECT` only their own roles
- ❌ No client-side `INSERT` / `UPDATE` / `DELETE`
- ✅ Service-role key (server-side) bypasses RLS

## 5. Update the Supabase Trigger

Run the contents of [`supabase/handle_new_user.sql`](../supabase/handle_new_user.sql) in the **Supabase SQL Editor**.

This updates the `handle_new_user()` trigger to stop inserting the old `role` column (which has been removed).

## 6. Verification Checklist

- [ ] `pnpm prisma migrate dev` completes without errors
- [ ] `pnpm db:seed` inserts 4 roles in the `Role` table
- [ ] No rows exist in `user_roles` after seed (assignment is manual)
- [ ] After assigning superadmin, user can log in to `/dashboard`
- [ ] RLS: an authenticated user querying `user_roles` via Supabase client sees only their own rows
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` succeeds
