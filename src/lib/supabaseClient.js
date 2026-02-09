import { createClient } from '@supabase/supabase-js'

// ⚠️ IMPORTANTE: Substitua os textos abaixo pelas suas chaves do Supabase!
const supabaseUrl = 'https://tmcnwwoitysxyziqvawc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY253d29pdHlzeHl6aXF2YXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTAxODcsImV4cCI6MjA4NjIyNjE4N30.EQNvtCN7mabs__nDTtGQgdBnTNCgHlPxnje_LfYFRCA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
