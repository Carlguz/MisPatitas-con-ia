import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, Users, CreditCard } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gray-600">
            Última actualización: 15 de agosto de 2024
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                1. Aceptación de los Términos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Al acceder y utilizar PetConnect, aceptas cumplir con estos términos y condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                2. Descripción del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                PetConnect es una plataforma que conecta a tres tipos de usuarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Clientes:</strong> Personas que buscan servicios de paseo de mascotas y productos para mascotas</li>
                <li><strong>Paseadores:</strong> Profesionales que ofrecen servicios de paseo y cuidado de mascotas</li>
                <li><strong>Vendedores:</strong> Comerciantes que venden productos relacionados con mascotas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                3. Responsabilidades del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Clientes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Proporcionar información veraz y actualizada</li>
                    <li>Tratar a los paseadores y vendedores con respeto</li>
                    <li>Pagar por los servicios y productos adquiridos</li>
                    <li>Calificar honestamente las experiencias</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Paseadores:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Tener experiencia y conocimiento en cuidado de mascotas</li>
                    <li>Cumplir con los horarios acordados</li>
                    <li>Proporcionar un servicio seguro y profesional</li>
                    <li>Mantener comunicación con los clientes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Vendedores:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Vender productos de calidad y seguros para mascotas</li>
                    <li>Describir los productos de manera precisa</li>
                    <li>Realizar envíos en los tiempos acordados</li>
                    <li>Ofrecer garantía según corresponda</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                4. Pagos y Comisiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Servicios de Paseo:</strong> Los paseadores cobran S/. 37.00 por servicio de WhatsApp. 
                  PetConnect cobra una comisión del 10% sobre cada transacción.
                </p>
                
                <p>
                  <strong>Venta de Productos:</strong> Los vendedores establecen sus propios precios. 
                  PetConnect cobra una comisión del 5% sobre cada venta.
                </p>
                
                <p>
                  <strong>Monedas:</strong> La plataforma acepta Soles Peruanos (PEN) y Dólares Americanos (USD). 
                  Los usuarios pueden cambiar entre monedas usando el selector de moneda.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cancelaciones y Reembolsos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-700">
                <p><strong>Cancelación por Cliente:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Con 24h de anticipación: Reembolso completo</li>
                  <li>Con 12-24h de anticipación: Reembolso del 50%</li>
                  <li>Menos de 12h: Sin reembolso</li>
                </ul>
                
                <p><strong>Cancelación por Paseador:</strong> Reembolso completo y compensación del 20% para el cliente.</p>
                
                <p><strong>Devolución de Productos:</strong> Aceptada dentro de 7 días, el producto debe estar en su estado original.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Todo el contenido de PetConnect, incluyendo但不限于 texto, gráficos, logotipos, imágenes, 
                software y diseños, es propiedad de PetConnect o sus licenciantes y está protegido por 
                las leyes de propiedad intelectual.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                PetConnect no se responsabiliza por daños directos, indirectos, incidentales, 
                especiales o consecuentes que surjan del uso o la incapacidad de usar la plataforma, 
                incluyendo但不限于 daños por pérdida de beneficios, datos u otros bienes intangibles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modificaciones de los Términos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                PetConnect se reserva el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor al momento de su publicación en la plataforma. 
                El uso continuado de la plataforma después de dichas modificaciones constituye 
                la aceptación de los nuevos términos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Estos términos se rigen por las leyes del Perú. Cualquier disputa relacionada 
                con estos términos o el uso de la plataforma se resolverá en los tribunales 
                competentes de Lima, Perú.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Si tienes preguntas sobre estos términos y condiciones, por favor contáctanos en:<br />
                <strong>Email:</strong> info@petconnect.com<br />
                <strong>Teléfono:</strong> +1 234 567 890<br />
                <strong>Horario:</strong> Lunes a Viernes, 9AM - 6PM
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <WhatsAppFloat />
    </div>
  )
}