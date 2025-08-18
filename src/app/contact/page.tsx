import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Building,
  Users,
  HelpCircle,
  Star
} from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contacto
          </h1>
          <p className="text-lg text-gray-600">
            Estamos aquí para ayudarte. Contáctanos por cualquier consulta o sugerencia.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información de Contacto */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-600" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Teléfono</p>
                    <p className="text-gray-600">+1 234 567 890</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">info@petconnect.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <p className="text-gray-600">+51 987 654 321</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dirección</p>
                    <p className="text-gray-600">Av. Principal 123, Lima, Perú</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Horario</p>
                    <p className="text-gray-600">Lunes a Domingo<br />9:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Departamentos */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Departamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">Soporte Técnico</h4>
                  <p className="text-sm text-blue-700 mb-2">Problemas técnicos y de plataforma</p>
                  <p className="text-xs text-blue-600">soporte@petconnect.com</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">Ventas</h4>
                  <p className="text-sm text-green-700 mb-2">Información sobre servicios y precios</p>
                  <p className="text-xs text-green-600">ventas@petconnect.com</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-1">Atención al Cliente</h4>
                  <p className="text-sm text-purple-700 mb-2">Consultas generales y seguimiento</p>
                  <p className="text-xs text-purple-600">atencion@petconnect.com</p>
                </div>
                
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-1">Emergencias</h4>
                  <p className="text-sm text-red-700 mb-2">Urgencias y casos críticos</p>
                  <p className="text-xs text-red-600">emergencias@petconnect.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Redes Sociales */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Síguenos en Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Mantente informado sobre nuestras novedades, promociones y eventos.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <span className="w-4 h-4 bg-blue-600 rounded mr-2"></span>
                    Facebook
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="w-4 h-4 bg-pink-500 rounded mr-2"></span>
                    Instagram
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="w-4 h-4 bg-blue-400 rounded mr-2"></span>
                    Twitter
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="w-4 h-4 bg-red-600 rounded mr-2"></span>
                    YouTube
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de Contacto */}
          <div className="lg:col-span-2">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-orange-600" />
                  Envíanos un Mensaje
                </CardTitle>
                <p className="text-gray-600">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre Completo *</Label>
                      <Input 
                        id="nombre" 
                        placeholder="Juan Pérez" 
                        required 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="juan@email.com" 
                        required 
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input 
                        id="telefono" 
                        placeholder="+51 987 654 321" 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="asunto">Asunto *</Label>
                      <Input 
                        id="asunto" 
                        placeholder="Consulta sobre servicios" 
                        required 
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <select 
                      id="departamento" 
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecciona un departamento</option>
                      <option value="soporte">Soporte Técnico</option>
                      <option value="ventas">Ventas</option>
                      <option value="atencion">Atención al Cliente</option>
                      <option value="emergencias">Emergencias</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea 
                      id="mensaje" 
                      placeholder="Describe tu consulta o sugerencia en detalle..." 
                      required 
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="terminos" 
                      required 
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <Label htmlFor="terminos" className="text-sm text-gray-600">
                      Acepto los términos y condiciones y la política de privacidad *
                    </Label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      Limpiar Formulario
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preguntas Frecuentes Rápidas */}
            <Card className="border-blue-200 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Preguntas Frecuentes Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">¿Cómo me registro?</h4>
                    <p className="text-sm text-blue-700">
                      Haz clic en "Registrarse" y completa el formulario. Recibirás un email de confirmación.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-1">¿Cuánto cuestan los servicios?</h4>
                    <p className="text-sm text-green-700">
                      Los paseos cuestan S/. 37.00. Los productos tienen precios variables según el vendedor.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-1">¿Es seguro usar PetConnect?</h4>
                    <p className="text-sm text-purple-700">
                      Sí, verificamos a todos nuestros usuarios y usamos sistemas de pago seguros.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-1">¿Cómo funcionan los pagos?</h4>
                    <p className="text-sm text-orange-700">
                      Aceptamos tarjetas, transferencias y billeteras digitales. Todo es seguro y encriptado.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    Ver todas las preguntas frecuentes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <WhatsAppFloat />
    </div>
  )
}