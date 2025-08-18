import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Users, Dog, Store, CreditCard, Shield, Clock } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra respuestas a las preguntas más comunes sobre PetConnect
          </p>
        </div>

        <div className="space-y-6">
          {/* Preguntas Generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-600" />
                Preguntas Generales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué es PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    PetConnect es una plataforma que conecta a tres tipos de usuarios: clientes que buscan 
                    servicios de paseo de mascotas y productos, paseadores que ofrecen servicios profesionales 
                    de cuidado de mascotas, y vendedores que venden productos relacionados con mascotas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo funciona PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    Los clientes pueden buscar y contratar paseadores, comprar productos de vendedores, 
                    y calificar los servicios recibidos. Los paseadores pueden crear perfiles profesionales, 
                    definir sus horarios y recibir pagos. Los vendedores pueden crear tiendas online, 
                    gestionar inventario y procesar pedidos.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Es seguro usar PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    Sí, implementamos medidas de seguridad robustas incluyendo verificación de usuarios, 
                    encriptación de datos, pasarelas de pago seguras y un sistema de calificaciones 
                    para garantizar la calidad y seguridad de todos los servicios.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿En qué países está disponible PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    Actualmente estamos disponibles en Perú, con planes de expansión a otros países 
                    de Latinoamérica. Aceptamos Soles Peruanos (PEN) y Dólares Americanos (USD).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Preguntas para Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Preguntas para Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cómo me registro como cliente?</AccordionTrigger>
                  <AccordionContent>
                    Haz clic en "Soy Cliente" en la página principal, completa el formulario de registro 
                    con tus datos personales, verifica tu correo electrónico y listo. El proceso toma 
                    menos de 5 minutos.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo encuentro un paseador de confianza?</AccordionTrigger>
                  <AccordionContent>
                    Puedes buscar paseadores por ubicación, ver sus perfiles, leer reseñas de otros 
                    clientes, verificar sus calificaciones y experiencia. Todos nuestros paseadores 
                    son verificados por nuestro equipo.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cuánto cuesta el servicio de paseo?</AccordionTrigger>
                  <AccordionContent>
                    El precio base por servicio de paseo es de S/. 37.00. Algunos paseadores pueden 
                    tener precios diferentes según su experiencia y los servicios adicionales que ofrezcan.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cómo hago un pedido de productos?</AccordionTrigger>
                  <AccordionContent>
                    Busca los productos que deseas, añádelos al carrito, completa tus datos de envío, 
                    selecciona el método de pago y confirma tu pedido. Recibirás un correo electrónico 
                    con los detalles de tu compra.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
                  <AccordionContent>
                    Aceptamos tarjetas de crédito/débito, transferencias bancarias, y pagos mediante 
                    billeteras digitales. Todos los pagos son procesados de forma segura.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Preguntas para Paseadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-green-600" />
                Preguntas para Paseadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué requisitos necesito para ser paseador?</AccordionTrigger>
                  <AccordionContent>
                    Debes ser mayor de 18 años, tener experiencia en cuidado de mascotas, contar con 
                    DNI o documento de identidad, tener disponibilidad de horarios, y pasar un proceso 
                    de verificación por nuestro equipo.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo me registro como paseador?</AccordionTrigger>
                  <AccordionContent>
                    Selecciona "Soy Paseador" en el registro, completa tu perfil profesional, 
                    sube tus documentos de verificación, define tus horarios disponibles y espera 
                    la aprobación de nuestro equipo (usualmente 24-48 horas).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cuánto puedo ganar como paseador?</AccordionTrigger>
                  <AccordionContent>
                    El precio base por servicio es de S/. 37.00. PetConnect cobra una comisión del 10%, 
                    por lo que recibirías S/. 33.30 por servicio. Puedes aumentar tus ingresos 
                    ofreciendo servicios adicionales o atendiendo a varios clientes.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cómo recibo mis pagos?</AccordionTrigger>
                  <AccordionContent>
                    Los pagos se procesan automáticamente después de completar cada servicio. 
                    El dinero se deposita en tu cuenta de PetConnect y puedes retirarlo a tu 
                    cuenta bancaria o billetera digital cuando lo desees.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Qué pasa si necesito cancelar un servicio?</AccordionTrigger>
                  <AccordionContent>
                    Si cancelas con 24h de anticipación, no hay penalidad. Si cancelas con menos 
                    tiempo, se aplicará una compensación para el cliente. Te recomendamos comunicarte 
                    directamente con el cliente para coordinar.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Preguntas para Vendedores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                Preguntas para Vendedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué puedo vender en PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    Puedes vender productos relacionados con mascotas como alimentos, juguetes, 
                    accesorios, productos de higiene, medicamentos (con permisos), ropa para mascotas, 
                    y cualquier otro artículo que sea seguro y beneficioso para las mascotas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo creo mi tienda online?</AccordionTrigger>
                  <AccordionContent>
                    Regístrate como vendedor, completa tus datos empresariales, sube los documentos 
                    requeridos (RUC, licencia comercial), crea tu catálogo de productos con fotos 
                    y descripciones, y espera la aprobación de nuestro equipo.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cuánto cobra PetConnect por comisión?</AccordionTrigger>
                  <AccordionContent>
                    Cobramos una comisión del 5% sobre cada venta realizada. No hay costos de 
                    registro ni mensualidades. Solo pagas cuando vendes.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cómo gestiono mis envíos?</AccordionTrigger>
                  <AccordionContent>
                    Puedes configurar tus propias tarifas de envío por zona, usar servicios de 
                    mensajería asociados, o ofrecer retiro en tienda. La plataforma te notificará 
                    cada vez que recibas un pedido para que puedas prepararlo y enviarlo.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Qué pasa si un cliente quiere devolver un producto?</AccordionTrigger>
                  <AccordionContent>
                    Aceptamos devoluciones dentro de 7 días. El producto debe estar en su estado 
                    original. El cliente te contactará directamente para coordinar la devolución 
                    y el reembolso se procesará una vez recibido el producto.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Preguntas de Pagos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Preguntas de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Es seguro pagar en PetConnect?</AccordionTrigger>
                  <AccordionContent>
                    Sí, utilizamos pasarelas de pago certificadas con encriptación SSL de 256 bits. 
                    Nunca almacenamos los datos de tu tarjeta en nuestros servidores. Todos los pagos 
                    son procesados por entidades financieras reguladas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Puedo cambiar entre monedas?</AccordionTrigger>
                  <AccordionContent>
                    Sí, aceptamos Soles Peruanos (PEN) y Dólares Americanos (USD). Puedes cambiar 
                    entre monedas usando el selector de moneda en la parte superior de la página. 
                    Las conversiones se realizan al tipo de cambio del día.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Cómo solicito un reembolso?</AccordionTrigger>
                  <AccordionContent>
                    Ve a tu historial de pedidos, selecciona el pedido que deseas reembolsar y haz 
                    clic en "Solicitar reembolso". Describe el motivo y nuestro equipo revisará tu 
                    solicitud en un plazo máximo de 48 horas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cuánto tiempo tarda un reembolso?</AccordionTrigger>
                  <AccordionContent>
                    Una vez aprobado, los reembolsos a tarjetas de crédito pueden tardar entre 3-7 
                    días hábiles. Los reembolsos a cuentas bancarias pueden tardar entre 1-3 días 
                    hábiles, dependiendo de tu banco.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Preguntas de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Preguntas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cómo protegen mis datos personales?</AccordionTrigger>
                  <AccordionContent>
                    Implementamos encriptación de datos, firewalls, control de acceso, y seguimos 
                    estrictamente las leyes de protección de datos. Nunca compartimos tus datos 
                    personales con terceros sin tu consentimiento.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo verifican a los paseadores y vendedores?</AccordionTrigger>
                  <AccordionContent>
                    Realizamos verificación de identidad, revisión de antecedentes, verificación 
                    de experiencia, y entrevistas personales. Solo aprobamos perfiles que cumplen 
                    con nuestros estándares de calidad y seguridad.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Qué pasa si tengo un problema con un servicio?</AccordionTrigger>
                  <AccordionContent>
                    Puedes contactar a nuestro equipo de soporte 24/7, calificar el servicio, 
                    dejar un comentario detallado, y en casos graves, podemos mediar en la disputa 
                    y ofrecer soluciones como reembolsos parciales o completos.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Cómo puedo reportar un usuario o actividad sospechosa?</AccordionTrigger>
                  <AccordionContent>
                    En cada perfil de usuario hay un botón "Reportar". También puedes contactarnos 
                    directamente a soporte@petconnect.com. Investigamos todos los reportes y tomamos 
                    las acciones necesarias, incluyendo la suspensión de cuentas.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Card de Contacto Final */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                ¿No encontraste lo que buscabas?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Si no encontraste respuesta a tu pregunta, nuestro equipo de soporte está disponible 
                para ayudarte. No dudes en contactarnos.
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> soporte@petconnect.com</p>
                <p><strong>Teléfono:</strong> +1 234 567 890</p>
                <p><strong>WhatsApp:</strong> +51 987 654 321</p>
                <p><strong>Horario:</strong> Lunes a Domingo, 9AM - 9PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WhatsAppFloat />
    </div>
  )
}