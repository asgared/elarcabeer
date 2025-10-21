create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public."User" (id, email, name, "lastName", role)
  values (
    new.id,
    new.email,
    -- CORRECCIÓN: Usamos una función segura que devuelve NULL si la clave no existe.
    jsonb_extract_path_text(new.raw_user_meta_data, 'name'),
    jsonb_extract_path_text(new.raw_user_meta_data, 'lastName'),
    -- Mantenemos la lógica del rol que ya es correcta.
    coalesce(
      (jsonb_extract_path_text(new.raw_user_meta_data, 'role'))::public."UserRole",
      'USER'::public."UserRole"
    )
  );
  return new;
end;
$$;