import { createClient } from "@supabase/supabase-js";

// Nota: Estas variables de entorno deben estar configuradas
// SOLO en el servidor (ej. en Vercel) y no deben tener el prefijo NEXT_PUBLIC_.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase URL or Service Role Key are not defined for admin client."
  );
}

export function createSupabaseAdminClient() {
  // Asegúrate de que la función aquí también esté en minúscula: createClient
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Es importante deshabilitar estas opciones en un cliente de servidor.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}