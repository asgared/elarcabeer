import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/lib/database.types'

import { createClient } from '@supabase/supabase-js'

export const supabase = createPagesBrowserClient<Database>()

export const getServiceSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

