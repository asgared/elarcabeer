-- =============================================================================
-- Updated handle_new_user trigger
-- =============================================================================
-- IMPORTANT: The `role` column has been removed from the User table.
-- Roles are now managed via the `user_roles` join table (RBAC).
-- New users are created WITHOUT any role. Roles must be assigned explicitly.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, "lastName")
  VALUES (
    new.id,
    new.email,
    jsonb_extract_path_text(new.raw_user_meta_data, 'name'),
    jsonb_extract_path_text(new.raw_user_meta_data, 'lastName')
  );
  RETURN new;
END;
$$;