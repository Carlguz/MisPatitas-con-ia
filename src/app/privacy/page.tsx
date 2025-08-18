import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
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
                1. Compromiso de Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                En PetConnect, nos comprometemos a proteger tu privacidad y garantizar la seguridad 
                de tus datos personales. Esta política describe cómo recopilamos, usamos, 
                almacenamos y protegemos tu información.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-600" />
                2. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información Personal:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Nombre completo</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Dirección (para envíos)</li>
                    <li>Foto de perfil</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información de la Cuenta:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Nombre de usuario</li>
                    <li>Contraseña (encriptada)</li>
                    <li>Tipo de cuenta (Cliente, Paseador, Vendedor)</li>
                    <li>Historial de transacciones</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información de Uso:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Dirección IP</li>
                    <li>Tipo de dispositivo</li>
                    <li>Navegador web</li>
                    <li>Páginas visitadas</li>
                    <li>Tiempo de uso</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                3. Cómo Usamos tu Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Proporcionar Servicios:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Conectar clientes con paseadores y vendedores</li>
                    <li>Procesar pagos y transacciones</li>
                    <li>Enviar confirmaciones de reservas</li>
                    <li>Proporcionar soporte al cliente</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Mejorar la Plataforma:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Analizar patrones de uso</li>
                    <li>Mejorar la experiencia del usuario</li>
                    <li>Desarrollar nuevas funcionalidades</li>
                    <li>Personalizar contenido</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Para Comunicación:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Enviar notificaciones importantes</li>
                    <li>Informar sobre actualizaciones</li>
                    <li>Enviar boletines informativos (con consentimiento)</li>
                    <li>Responder consultas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                4. Protección de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  Implementamos medidas de seguridad robustas para proteger tu información:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Encriptación:</strong> Todos los datos sensibles se encriptan usando SSL/TLS</li>
                  <li><strong>Almacenamiento seguro:</strong> Contraseñas almacenadas como hash</li>
                  <li><strong>Control de acceso:</strong> Solo personal autorizado puede acceder a los datos</li>
                  <li><strong>Firewalls:</strong> Protección contra accesos no autorizados</li>
                  <li><strong>Actualizaciones:</strong> Mantenemos nuestros sistemas actualizados</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Compartir Información con Terceros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p><strong>No vendemos tus datos personales a terceros.</strong></p>
                
                <p>Compartimos información solo en los siguientes casos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Proveedores de servicios:</strong> Pasarelas de pago, servicios de correo electrónico</li>
                  <li><strong>Requisitos legales:</strong> Cuando lo exija la ley o autoridades competentes</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos o los de otros usuarios</li>
                  <li><strong>Transferencia de negocio:</strong> En caso de fusión o adquisición</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                  <li><strong>Cookies de rendimiento:</strong> Analizan cómo usas la plataforma</li>
                  <li><strong>Cookies de funcionalidad:</strong> Recuerdan tus preferencias</li>
                  <li><strong>Cookies de publicidad:</strong> Muestran anuncios relevantes</li>
                </ul>
                
                <p>
                  Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar 
                  el funcionamiento de algunas características de la plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Derechos del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>Tienes los siguientes derechos sobre tus datos personales:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Acceder:</strong> Solicitar una copia de tus datos personales</li>
                  <li><strong>Rectificar:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Eliminar:</strong> Solicitar la eliminación de tus datos</li>
                  <li><strong>Limitar:</strong> Restringir el procesamiento de tus datos</li>
                  <li><strong>Portabilidad:</strong> Transferir tus datos a otro servicio</li>
                  <li><strong>Oponerse:</strong> Oponerte al procesamiento de tus datos</li>
                </ul>
                
                <p>
                  Para ejercer estos derechos, contáctanos en info@petconnect.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  Conservamos tus datos personales solo durante el tiempo necesario para 
                  cumplir con los fines para los que fueron recopilados:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Cuentas activas:</strong> Mientras mantengas tu cuenta</li>
                  <li><strong>Cuentas inactivas:</strong> 2 años después del último inicio de sesión</li>
                  <li><strong>Transacciones:</strong> 7 años por razones fiscales y legales</li>
                  <li><strong>Registros de actividad:</strong> 1 año para análisis y seguridad</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Transferencias Internacionales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Tus datos pueden ser almacenados y procesados en servidores ubicados fuera de tu país. 
                Nos aseguramos de que todas las transferencias cumplan con las leyes de protección 
                de datos aplicables y que tus datos reciban el mismo nivel de protección.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Cambios en esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Podemos actualizar esta política de privacidad periódicamente. Te notificaremos 
                de cualquier cambio significativo mediante un aviso en nuestra plataforma o 
                por correo electrónico. El uso continuado de la plataforma después de dichos 
                cambios constituye la aceptación de la nueva política.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos 
                tus datos personales, por favor contáctanos:<br />
                <strong>Email:</strong> privacy@petconnect.com<br />
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