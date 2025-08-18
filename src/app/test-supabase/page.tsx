'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSupabase() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.from('Categories').select('*').limit(5)
      
      if (error) {
        setError(error.message)
      } else {
        setMessage(`Conexión exitosa! Encontradas ${data?.length || 0} categorías`)
        console.log('Categorías:', data)
      }
    } catch (err) {
      setError('Error al conectar con Supabase')
    } finally {
      setLoading(false)
    }
  }

  const testSignUp = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Usuario registrado exitosamente! Revisa tu email para confirmar.')
        console.log('Usuario:', data)
      }
    } catch (err) {
      setError('Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test de Conexión Supabase</CardTitle>
          <CardDescription>
            Prueba la conexión entre tu aplicación Next.js y Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Probando conexión...' : 'Probar Conexión'}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Test de Registro</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button 
                onClick={testSignUp} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Registrando...' : 'Registrar Usuario'}
              </Button>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}