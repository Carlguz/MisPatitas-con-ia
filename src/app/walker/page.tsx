"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
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
  Mail,
  Instagram,
  Facebook,
  Twitter,
  BarChart3,
  MessageCircle
} from "lucide-react"
import { useCurrencyContext } from "@/components/currency-provider"

// Tipos de datos (interfaces)
interface Service {
  id: string; name: string; description?: string; price: number;
  duration: number; isActive: boolean; averageRating?: number; totalReviews?: number;
  walker: { id: string; name: string; averageRating?: number; phone?: string; };
}
interface Schedule { id: string; dayOfWeek: number; startTime: string; endTime: string; isActive: boolean; }
interface SocialLink { id: string; platform: string; url: string; isActive: boolean; }
interface WalkerStats { totalServices: number; totalBookings: number; totalRevenue: number; averageRating: number; completedWalks: number; }
interface WhatsAppConfig { whatsapp?: string; whatsappEnabled: boolean; whatsappPaid: boolean; }

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export default function WalkerDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { format } = useCurrencyContext()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const [stats, setStats] = useState<WalkerStats>({ totalServices: 0, totalBookings: 0, totalRevenue: 0, averageRating: 0, completedWalks: 0 })
  const [services, setServices] = useState<Service[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({ whatsappEnabled: false, whatsappPaid: false })

  const loadData = useCallback(async () => {
    try {
      // Usamos Promise.all para cargar datos en paralelo
      const [
        statsResponse,
        servicesResponse,
        schedulesResponse,
        socialLinksResponse,
        whatsappResponse,
      ] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/services'),
        fetch('/api/schedules'),
        fetch('/api/social-links'),
        fetch('/api/walkers/whatsapp'),
      ]);

      if (statsResponse.ok) setStats((await statsResponse.json()).stats);
      if (servicesResponse.ok) setServices((await servicesResponse.json()).services);
      if (schedulesResponse.ok) setSchedules((await schedulesResponse.json()).schedules);
      if (socialLinksResponse.ok) setSocialLinks((await socialLinksResponse.json()).socialLinks);
      if (whatsappResponse.ok) setWhatsappConfig((await whatsappResponse.json()).walker);

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'WALKER') {
        await supabase.auth.signOut();
        router.push("/");
        return;
      }
      
      setUser(session.user);
      await loadData();
      setLoading(false);
    };

    checkUserAndLoadData();
  }, [router, supabase, loadData]);

  const handleDelete = async (
    endpoint: string,
    id: string,
    itemName: string
  ) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${itemName}?`)) {
      return
    }
    try {
      const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadData()
      } else {
        const error = await response.json()
        alert(error.error || `Error al eliminar el ${itemName}`)
      }
    } catch (error) {
      console.error(`Error deleting ${itemName}:`, error)
      alert(`Error al eliminar el ${itemName}`)
    }
  }

  const handleDeleteService = (id: string) => handleDelete('services', id, 'servicio');
  const handleDeleteSchedule = (id: string) => handleDelete('schedules', id, 'horario');
  const handleDeleteSocialLink = (id: string) => handleDelete('social-links', id, 'enlace social');

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "facebook": return <Facebook className="h-4 w-4" />;
      case "twitter": return <Twitter className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  }

  if (loading) {
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
            <div className="h-10 bg-gray-200 rounded w-full"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
            Gestiona tus servicios, horarios y perfil público.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Servicios</CardTitle><Dog className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div><p className="text-xs text-gray-600">{services.filter(s => s.isActive).length} activos</p></CardContent></Card>
          <Card className="bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Reservas</CardTitle><Calendar className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div><p className="text-xs text-gray-600">{stats.completedWalks} completados</p></CardContent></Card>
          <Card className="bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{format(stats.totalRevenue)}</div><p className="text-xs text-gray-600">+15% desde el mes pasado</p></CardContent></Card>
          <Card className="bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Calificación</CardTitle><Star className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div><p className="text-xs text-gray-600">Basado en reseñas</p></CardContent></Card>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          {/* Pestaña de Servicios */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-900">Mis Servicios</h2><ServiceModal onSuccess={loadData}><Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" />Nuevo Servicio</Button></ServiceModal></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (<Card key={service.id} className="bg-white shadow-sm hover:shadow-md transition-shadow"><CardHeader><div className="flex items-start justify-between"><CardTitle className="text-lg">{service.name}</CardTitle><Badge variant={service.isActive ? "default" : "secondary"}>{service.isActive ? "Activo" : "Inactivo"}</Badge></div><CardDescription>{service.description}</CardDescription></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Precio</span><span className="text-lg font-semibold text-green-600">{format(service.price)}</span></div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Duración</span><span className="text-sm font-medium">{service.duration} min</span></div>{service.averageRating != null && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-orange-600 fill-current" />
                          <span className="text-sm font-medium">{service.averageRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({service.totalReviews || 0})</span>
                        </div>
                      )}<div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1"><Eye className="mr-1 h-3 w-3" />Ver</Button><ServiceModal service={service} onSuccess={loadData}><Button variant="outline" size="sm" className="flex-1"><Edit className="mr-1 h-3 w-3" />Editar</Button></ServiceModal><Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDeleteService(service.id)}><Trash2 className="mr-1 h-3 w-3" />Eliminar</Button></div>{service.walker.phone && (<div className="mt-2"><WhatsAppButton phoneNumber={service.walker.phone} message={`Hola, estoy interesado en el servicio: ${service.name}`} size="sm" className="w-full"/></div>)}</div></CardContent></Card>))}
            </div>
          </TabsContent>

          {/* Pestaña de Horarios */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-900">Mi Horario</h2><ScheduleModal onSuccess={loadData}><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Agregar Horario</Button></ScheduleModal></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (<Card key={schedule.id} className="bg-white shadow-sm"><CardHeader><CardTitle className="text-lg">{dayNames[schedule.dayOfWeek]}</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium">{schedule.startTime} - {schedule.endTime}</span></div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Estado</span><Badge variant={schedule.isActive ? "default" : "secondary"}>{schedule.isActive ? "Activo" : "Inactivo"}</Badge></div><div className="flex gap-2 pt-2"><ScheduleModal schedule={schedule} onSuccess={loadData}><Button variant="outline" size="sm" className="flex-1"><Edit className="mr-1 h-3 w-3" />Editar</Button></ScheduleModal><Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDeleteSchedule(schedule.id)}><Trash2 className="mr-1 h-3 w-3" />Eliminar</Button></div></div></CardContent></Card>))}
            </div>
          </TabsContent>
          
          {/* Pestaña de Redes Sociales */}
           <TabsContent value="social" className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-900">Redes Sociales</h2><Button className="bg-purple-600 hover:bg-purple-700"><Plus className="mr-2 h-4 w-4" />Agregar Red Social</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialLinks.map((link) => (<Card key={link.id} className="bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2">{getSocialIcon(link.platform)}{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-600" /><span className="text-sm font-medium truncate">{link.url}</span></div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Estado</span><Badge variant={link.isActive ? "default" : "secondary"}>{link.isActive ? "Activo" : "Inactivo"}</Badge></div><div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1"><Edit className="mr-1 h-3 w-3" />Editar</Button><Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDeleteSocialLink(link.id)}><Trash2 className="mr-1 h-3 w-3" />Eliminar</Button></div></div></CardContent></Card>))}
            </div>
          </TabsContent>

          {/* Pestaña de WhatsApp */}
           <TabsContent value="whatsapp" className="space-y-6">
            <div className="flex justify-between items-center"><div><h2 className="text-xl font-semibold text-gray-900">Configuración de WhatsApp</h2><p className="text-gray-600 mt-1">Gestiona tu número para que los clientes puedan contactarte.</p></div><WhatsAppConfigModal onSuccess={loadData} config={whatsappConfig}><Button className="bg-green-600 hover:bg-green-700"><MessageCircle className="mr-2 h-4 w-4" />Configurar</Button></WhatsAppConfigModal></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-600" />Estado del Servicio</CardTitle><CardDescription>Estado actual de tu configuración</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Número</span>{whatsappConfig.whatsapp ? <Badge variant="default" className="bg-green-100 text-green-800">{whatsappConfig.whatsapp}</Badge> : <Badge variant="secondary">No configurado</Badge>}</div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Servicio activo</span>{whatsappConfig.whatsappEnabled && whatsappConfig.whatsappPaid ? <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}</div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Pago</span>{whatsappConfig.whatsappPaid ? <Badge variant="default" className="bg-green-100 text-green-800">Pagado</Badge> : <Badge variant="secondary">Pendiente</Badge>}</div></CardContent></Card>
              <Card className="bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-orange-600" />Beneficios</CardTitle><CardDescription>Ventajas de activar el servicio</CardDescription></CardHeader><CardContent><ul className="space-y-3 text-sm text-gray-700"><li><CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />Comunicación directa con clientes.</li><li><CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />Aumenta la confianza y seguridad.</li><li><CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />Destaca en los resultados de búsqueda.</li></ul></CardContent></Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      <WhatsAppFloat />
    </div>
  )
}
