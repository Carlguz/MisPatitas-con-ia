import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test connection by getting the first user
    const { data, error } = await supabase.from('Users').select('count', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: 'Conexión a Supabase exitosa',
      count: data 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al conectar con Supabase' 
    }, { status: 500 })
  }
}