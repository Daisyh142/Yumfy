import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim()
export const publicAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !publicAnonKey) {
  throw new Error('Missing Supabase env vars. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, publicAnonKey)


