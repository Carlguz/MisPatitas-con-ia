"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Store, 
  Dog, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  ShoppingCart,
  Calendar,
  Star,
  Ban,
  UserCheck
} from "lucide-react"
import { UserRole } from "@prisma/client"

interface DashboardStats {
  totalUsers: number
  totalSellers: number
  totalWalkers: number
  totalCustomers: number
  totalOrders: number
  totalBookings: number
  totalRevenue: number
  pendingApprovals: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalWalkers: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== UserRole.ADMIN) {
      router.push("/")
      return
    }

    // Simular carga de datos
    const loadStats = async () => {
      // Aquí irían las llamadas API reales
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalSellers: 89,
          totalWalkers: 156,
          totalCustomers: 1002,
          totalOrders: 3421,
          totalBookings: 2156,
          totalRevenue: 125430,
          pendingApprovals: 12
        })
        setLoading(false)
      }, 1000)
    }

    loadStats()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">
            Gestiona toda la plataforma desde un solo lugar
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                +12% desde el mes pasado
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
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                +8% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Órdenes y Reservas
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(stats.totalOrders + stats.totalBookings).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600">
                +15% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendientes de Aprobación
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</div>
              <p className="text-xs text-gray-600">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="sellers">Vendedores</TabsTrigger>
            <TabsTrigger value="walkers">Paseadores</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Distribución de Usuarios
                  </CardTitle>
                  <CardDescription>
                    Desglose de usuarios por tipo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Clientes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats.totalCustomers}</span>
                      <Badge variant="secondary">
                        {((stats.totalCustomers / stats.totalUsers) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Paseadores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats.totalWalkers}</span>
                      <Badge variant="secondary">
                        {((stats.totalWalkers / stats.totalUsers) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Vendedores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{stats.totalSellers}</span>
                      <Badge variant="secondary">
                        {((stats.totalSellers / stats.totalUsers) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Últimas actividades en la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva orden #1234</p>
                      <p className="text-xs text-gray-600">Hace 5 minutos</p>
                    </div>
                    <Badge variant="outline">Orden</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo vendedor registrado</p>
                      <p className="text-xs text-gray-600">Hace 12 minutos</p>
                    </div>
                    <Badge variant="outline">Vendedor</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reserva de paseo confirmada</p>
                      <p className="text-xs text-gray-600">Hace 18 minutos</p>
                    </div>
                    <Badge variant="outline">Reserva</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>
                  Administra todos los usuarios de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Usuarios Activos</h4>
                      <p className="text-sm text-gray-600">Usuarios con acceso a la plataforma</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Clientes</h4>
                        <p className="text-sm text-gray-600">Usuarios que compran productos y servicios</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                        <Badge variant="secondary">Cliente</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Ver Todos los Usuarios
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Gestión de Vendedores
                </CardTitle>
                <CardDescription>
                  Administra las tiendas y vendedores de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Vendedores Registrados</h4>
                      <p className="text-sm text-gray-600">Total de vendedores en la plataforma</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.totalSellers}</p>
                      <Badge variant="secondary">Vendedor</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Pendientes de Aprobación</h4>
                      <p className="text-sm text-gray-600">Vendedores esperando aprobación</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">8</p>
                      <Badge variant="destructive">
                        <Clock className="mr-1 h-3 w-3" />
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar Vendedores
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Ban className="mr-2 h-4 w-4" />
                      Rechazar Vendedores
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="walkers" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dog className="h-5 w-5" />
                  Gestión de Paseadores
                </CardTitle>
                <CardDescription>
                  Administra los paseadores y sus servicios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Paseadores Registrados</h4>
                      <p className="text-sm text-gray-600">Total de paseadores en la plataforma</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.totalWalkers}</p>
                      <Badge variant="secondary">Paseador</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Pendientes de Aprobación</h4>
                      <p className="text-sm text-gray-600">Paseadores esperando aprobación</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">4</p>
                      <Badge variant="destructive">
                        <Clock className="mr-1 h-3 w-3" />
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar Paseadores
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Star className="mr-2 h-4 w-4" />
                      Ver Calificaciones
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración de la Plataforma
                  </CardTitle>
                  <CardDescription>
                    Ajusta las configuraciones generales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Comisión de la Plataforma</h4>
                      <p className="text-sm text-gray-600">Porcentaje de comisión por venta</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">10%</p>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Tasa de Impuestos</h4>
                      <p className="text-sm text-gray-600">Porcentaje de impuestos aplicados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">16%</p>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Monto Mínimo de Retiro</h4>
                      <p className="text-sm text-gray-600">Monto mínimo para retiros</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$50</p>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Alertas del Sistema
                  </CardTitle>
                  <CardDescription>
                    Notificaciones importantes del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Espacio en disco bajo</p>
                      <p className="text-xs text-gray-600">85% utilizado</p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Actualización disponible</p>
                      <p className="text-xs text-gray-600">Nueva versión disponible</p>
                    </div>
                    <Badge variant="outline">Info</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sistema operativo normal</p>
                      <p className="text-xs text-gray-600">Todos los servicios funcionando</p>
                    </div>
                    <Badge variant="secondary">OK</Badge>
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