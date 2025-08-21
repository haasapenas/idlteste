import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://cxbdwkbxwbvnrzbdmdil.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YmR3a2J4d2J2bnJ6YmRtZGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTE2NDEsImV4cCI6MjA3MTM4NzY0MX0.amxneQMa1cIDqQhhLqFjTZEEjxuk7Bm9beFhnApl274'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

