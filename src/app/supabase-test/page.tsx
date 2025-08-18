import SupabaseTest from '@/components/supabase-test'

export default function SupabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Prueba de Conexión a Supabase</h1>
          <p className="text-gray-600 mt-1">
            Verifica que tu aplicación PetConnect está correctamente conectada a Supabase
          </p>
        </div>
      </div>
      
      <SupabaseTest />
    </div>
  )
}