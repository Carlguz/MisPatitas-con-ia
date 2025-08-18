"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceModal } from "@/components/service-modal"
import { ScheduleModal } from "@/components/schedule-modal"
import { WhatsAppConfigModal } from "@/components/whatsapp-config-modal"
import { 
  Dog, 
  DollarSign, 
  Calendar, 
  Clock, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  BarChart3,
  MessageCircle
} from "lucide-react"
import { useCurrencyContext } from "@/components/currency-provider"
import { UserRole } from "@prisma/client"

interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  isActive: boolean
  walker: {
    id: string
    name: string
    averageRating?: number
    phone?: string
  }
  averageRating?: number
  totalReviews?: number
}

interface Schedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface SocialLink {
  id: string
  platform: string
  url: string
  isActive: boolean
}

interface WalkerStats {
  totalServices: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
  completedWalks: number
}

interface WhatsAppConfig {
  whatsapp?: string
  whatsappEnabled: boolean
  whatsappPaid: boolean
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export default function WalkerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { format, currency } = useCurrencyContext()
  const [stats, setStats] = useState<WalkerStats>({
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    completedWalks: 0
  })
  const [services, setServices] = useState<Service[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    whatsappEnabled: false,
    whatsappPaid: false
  })
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      // Cargar estadísticas
      const statsResponse = await fetch('/api/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Cargar servicios
      const servicesResponse = await fetch('/api/services')
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData.services)
      }

      // Cargar horarios
      const schedulesResponse = await fetch('/api/schedules')
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json()
        setSchedules(schedulesData.schedules)
      }

      // Cargar enlaces sociales
      const socialLinksResponse = await fetch('/api/social-links')
      if (socialLinksResponse.ok) {
        const socialLinksData = await socialLinksResponse.json()
        setSocialLinks(socialLinksData.socialLinks)
      }

      // Cargar configuración de WhatsApp
      const whatsappResponse = await fetch('/api/walkers/whatsapp')
      if (whatsappResponse.ok) {
        const whatsappData = await whatsappResponse.json()
        setWhatsappConfig(whatsappData.walker)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== UserRole.WALKER) {
      router.push("/")
      return
    }

    loadData()
  }, [session, status, router])

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData() // Recargar datos
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el servicio')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error al eliminar el servicio')
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData() // Recargar datos
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el horario')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Error al eliminar el horario')
    }
  }

  const handleDeleteSocialLink = async (linkId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este enlace social?')) {
      return
    }

    try {
      const response = await fetch(`/api/social-links/${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData() // Recargar datos
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el enlace social')
      }
    } catch (error) {
      console.error('Error deleting social link:', error)
      alert('Error al eliminar el enlace social')
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Paseador</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus servicios y horarios
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Servicios
              </CardTitle>
              <Dog className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
              <p className="text-xs text-gray-600">
                {services.filter(s => s.isActive).length} activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reservas
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-600">
                {stats.completedWalks} completados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600">
                +15% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Calificación Promedio
              </CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-gray-600">
                Basado en las reseñas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Mis Servicios</h2>
              <ServiceModal onSuccess={loadData}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Servicio
                </Button>
              </ServiceModal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Precio</span>
                        <span className="text-lg font-semibold text-green-600">
                          {format(service.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duración</span>
                        <span className="text-sm font-medium">{service.duration} min</span>
                      </div>
                      {service.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-orange-600 fill-current" />
                          <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({service.totalReviews})</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                        <ServiceModal service={service} onSuccess={loadData}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        </ServiceModal>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                      {service.walker.phone && (
                        <div className="mt-2">
                          <WhatsAppButton 
                            phoneNumber={service.walker.phone}
                            message={`Hola, estoy interesado en el servicio: ${service.name}`}
                            size="sm"
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Mi Horario</h2>
              <ScheduleModal onSuccess={loadData}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Horario
                </Button>
              </ScheduleModal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {dayNames[schedule.dayOfWeek]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado</span>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <ScheduleModal schedule={schedule} onSuccess={loadData}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        </ScheduleModal>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservas Recientes
                </CardTitle>
                <CardDescription>
                  Gestiona tus reservas de paseo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Reserva #1234</p>
                        <p className="text-sm text-gray-600">Paseo básico • Mañana 10:00</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Completado</Badge>
                      <p className="text-xs text-gray-600 mt-1">Hoy</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Reserva #1235</p>
                        <p className="text-sm text-gray-600">Paseo extendido • Tarde 15:00</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Confirmado</Badge>
                      <p className="text-xs text-gray-600 mt-1">Mañana</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Reserva #1236</p>
                        <p className="text-sm text-gray-600">Paseo premium • Mañana 09:00</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Pendiente</Badge>
                      <p className="text-xs text-gray-600 mt-1">En 2 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Redes Sociales</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Red Social
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialLinks.map((link) => (
                <Card key={link.id} className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getSocialIcon(link.platform)}
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium truncate">{link.url}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado</span>
                        <Badge variant={link.isActive ? "default" : "secondary"}>
                          {link.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configuración de WhatsApp</h2>
                <p className="text-gray-600 mt-1">
                  Gestiona tu número de WhatsApp para que los clientes puedan contactarte
                </p>
              </div>
              <WhatsAppConfigModal onSuccess={loadData}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Configurar WhatsApp
                </Button>
              </WhatsAppConfigModal>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado del servicio */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    Estado del Servicio
                  </CardTitle>
                  <CardDescription>
                    Estado actual de tu configuración de WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Número configurado</span>
                    {whatsappConfig.whatsapp ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {whatsappConfig.whatsapp}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No configurado</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Servicio activo</span>
                    {whatsappConfig.whatsappEnabled && whatsappConfig.whatsappPaid ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pago realizado</span>
                    {whatsappConfig.whatsappPaid ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Pagado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </div>
                  
                  {whatsappConfig.whatsapp && whatsappConfig.whatsappEnabled && whatsappConfig.whatsappPaid && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">¡Servicio activo!</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Los clientes ahora pueden contactarte directamente por WhatsApp
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Beneficios del servicio */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-600" />
                    Beneficios del Servicio
                  </CardTitle>
                  <CardDescription>
                    Ventajas de activar el servicio de WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Comunicación directa</p>
                        <p className="text-sm text-gray-600">Los clientes podrán contactarte directamente por WhatsApp</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Mayor confianza</p>
                        <p className="text-sm text-gray-600">Aumenta la confianza y seguridad de los clientes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Más reservas</p>
                        <p className="text-sm text-gray-600">Mejora la comunicación y aumenta tus reservas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Destacado</p>
                        <p className="text-sm text-gray-600">Acceso prioritario en las búsquedas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instrucciones */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium text-blue-900 mb-1">¿Cómo funciona?</p>
                    <ul className="space-y-1">
                      <li>• Configura tu número de WhatsApp</li>
                      <li>• Realiza el pago único de €9.99</li>
                      <li>• Los clientes verán tu botón de WhatsApp en tus servicios</li>
                      <li>• Solo los clientes con reservas podrán ver tu número</li>
                      <li>• Podrás comunicarte directamente con tus clientes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Ingresos del Mes
                  </CardTitle>
                  <CardDescription>
                    Resumen de ingresos mensuales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Ingresos</span>
                      <span className="text-2xl font-bold text-green-600">{format(2250)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Paseos Completados</span>
                      <span className="text-lg font-semibold">{stats.completedWalks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Promedio por Paseo</span>
                      <span className="text-lg font-semibold">{format(198.15)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reseñas y Calificaciones
                  </CardTitle>
                  <CardDescription>
                    Opiniones de tus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calificación Promedio</span>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-orange-600">4.8</span>
                        <Star className="h-4 w-4 text-orange-600 fill-current" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reseñas</span>
                      <span className="text-lg font-semibold">38</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reseñas Positivas</span>
                      <span className="text-lg font-semibold text-green-600">97%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <WhatsAppFloat />
    </div>
  )
}