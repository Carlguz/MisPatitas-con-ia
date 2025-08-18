'use client'

import { useState, useEffect } from 'react'
import { supabase, checkSupabaseConnection } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [products, setProducts] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus('checking')
    const isConnected = await checkSupabaseConnection()
    setConnectionStatus(isConnected ? 'connected' : 'error')
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(5)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Estado de Conexión a Supabase
            {connectionStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
            {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
          </CardTitle>
          <CardDescription>
            Verifica que tu aplicación está correctamente conectada a Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus === 'checking' && 'Verificando...'}
              {connectionStatus === 'connected' && 'Conectado'}
              {connectionStatus === 'error' && 'Error de conexión'}
            </Badge>
            <Button onClick={testConnection} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudo conectar a Supabase. Verifica tus credenciales en el archivo .env
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos Recientes</CardTitle>
            <CardDescription>
              Muestra los últimos productos de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={fetchProducts} 
              disabled={loading || connectionStatus !== 'connected'}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cargar Productos
            </Button>
            
            {products.length > 0 && (
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary">S/. {product.price}</Badge>
                      <Badge variant={product.is_active ? 'default' : 'destructive'}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfiles de Usuario</CardTitle>
            <CardDescription>
              Muestra los perfiles de usuario registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={fetchProfiles} 
              disabled={loading || connectionStatus !== 'connected'}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cargar Perfiles
            </Button>
            
            {profiles.length > 0 && (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{profile.full_name}</h4>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{profile.role}</Badge>
                      <Badge variant={profile.is_verified ? 'default' : 'secondary'}>
                        {profile.is_verified ? 'Verificado' : 'No verificado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}