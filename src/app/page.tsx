"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dog, Store, Users, Star, Clock, Shield, Heart } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conectamos Amantes de Mascotas
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              La plataforma completa para paseadores de mascotas, vendedores de productos y clientes. 
              Todo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-orange-600 hover:text-orange-700" asChild>
                <Link href="/auth/signup">Soy Cliente</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
                <Link href="/auth/signup">Soy Paseador</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
                <Link href="/auth/signup">Soy Vendedor</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-orange-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una solución completa para todas tus necesidades relacionadas con mascotas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Seguridad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Todos nuestros paseadores y vendedores son verificados y aprobados por nuestro equipo de administración.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Reservas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistema de reservas fácil de usar con disponibilidad en tiempo real y confirmación instantánea.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Amamos las Mascotas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comunidad apasionada por el bienestar animal con servicios y productos de la más alta calidad.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Eres...?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre cómo nuestra plataforma puede ayudarte según tu rol
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Cliente */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-orange-200">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Cliente</h3>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Encuentra paseadores de confianza</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Compra productos para mascotas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Reserva servicios en línea</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Califica tu experiencia</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/auth/signup">Soy Cliente</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Paseador */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-orange-200">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                <Dog className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Paseador</h3>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Crea tu perfil profesional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Define tus horarios disponibles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Comparte tus redes sociales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Recibe pagos seguros</span>
                  </li>
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/auth/signup">Soy Paseador</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Vendedor */}
            <Card className="overflow-hidden hover:shadow-xl transition-shadow border-orange-200">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white text-center">
                <Store className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Vendedor</h3>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Crea tu tienda online</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Gestiona tu inventario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Recibe pedidos en tiempo real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Controla tus ganancias</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/auth/signup">Soy Vendedor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Únete a nuestra comunidad y descubre una nueva forma de cuidar a tus mascotas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-orange-600 hover:text-orange-700" asChild>
                <Link href="/auth/signup">Registrarme Ahora</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" asChild>
                <Link href="#features">Conocer Más</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre Nosotros</h3>
              <p className="text-gray-400 text-sm">
                La plataforma líder en conectar paseadores de mascotas, vendedores y clientes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white">Para Clientes</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Para Paseadores</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Para Vendedores</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Ayuda</Link></li>
                <li><Link href="/terms" className="hover:text-white">Términos de Servicio</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@petconnect.com</li>
                <li>Tel: +1 234 567 890</li>
                <li>Horario: 9AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 PetConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      
      <WhatsAppFloat />
    </div>
  )
}