import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente para el lado del cliente (navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el lado del servidor (con privilegios de administrador)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper function para verificar si la conexión a Supabase está activa
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('Error conectando a Supabase:', error)
      return false
    }
    console.log('Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('Error de conexión a Supabase:', error)
    return false
  }
}