-- =============================================================================
-- RLS Policies for RBAC tables
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor AFTER running the Prisma migration.
-- These policies apply to the `user_roles` table managed by Prisma.
-- =============================================================================

-- 1. Enable Row Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. SELECT — authenticated users can only read their own role assignments
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- 3. By default, INSERT / UPDATE / DELETE are denied for all client roles.
--    Role assignment must be done via:
--      a) Server-side code using the service_role key (bypasses RLS)
--      b) Directly in Supabase Dashboard → Table Editor → user_roles

-- 4. (Future) Superadmin management policy — UNCOMMENT when ready
--    This allows users who themselves have the "superadmin" role to manage
--    other users' role assignments from a backend admin UI.
--
-- CREATE POLICY "Superadmins can manage all roles"
--   ON public.user_roles
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1
--       FROM public.user_roles AS ur
--       INNER JOIN public."Role" AS r ON r.id = ur.role_id
--       WHERE ur.user_id = auth.uid()::text
--         AND r.key = 'superadmin'
--     )
--   );

-- =============================================================================
-- RLS for the Role table (read-only for everyone)
-- =============================================================================
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON public."Role"
  FOR SELECT
  TO authenticated
  USING (true);
