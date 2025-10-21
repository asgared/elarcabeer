create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata jsonb := new.raw_user_meta_data;
begin
  insert into public."User" ("id", "email", "name", "lastName", "role")
  values (
    new.id,
    new.email,
    nullif(metadata->>'name', ''),
    nullif(metadata->>'lastName', ''),
    coalesce(
      nullif(metadata->>'role', '')::public."UserRole",
      'USER'::public."UserRole"
    )
  )
  on conflict ("id") do update
    set
      "email" = excluded."email",
      "name" = excluded."name",
      "lastName" = excluded."lastName",
      "role" = excluded."role";

  return new;
end;
$$;
