import { createClient } from '@supabase/supabase-js'

const projectId = (process.env.SUPABASE_PROJECT_ID || '').trim()
const publicAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim()

if (!projectId || !publicAnonKey) {
  throw new Error('Missing Supabase env vars. Set SUPABASE_PROJECT_ID and SUPABASE_ANON_KEY')
}

const supabaseUrl = `https://${projectId}.supabase.co`

export const supabase = createClient(supabaseUrl, publicAnonKey)

export { projectId, publicAnonKey, supabaseUrl }
