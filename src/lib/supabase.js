import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sobnlccemyvflzzkvble.supabase.co'

const supabaseKey =
  'sb_publishable_p9SpkkEV1d4Exkpl4uKf7w_6Ts0XY0G'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)