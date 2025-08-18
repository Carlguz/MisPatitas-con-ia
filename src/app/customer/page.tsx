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
import { 
  ShoppingCart, 
  Dog, 
  Calendar, 
  Star, 
  Search, 
  Filter, 
  MapPin,
  Clock,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Heart,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { useCurrencyContext } from "@/components/currency-provider"
import { UserRole } from "@prisma/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image?: string
  seller: {
    storeName: string
    phone?: string
  }
  rating: number
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  walker: {
    name: string
    averageRating: number
    phone?: string
    whatsapp?: string
    whatsappEnabled: boolean
    whatsappPaid: boolean
  }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
}

interface Booking {
  id: string
  service: {
    name: string
  }
  walker: {
    name: string
    phone?: string
    whatsapp?: string
    whatsappEnabled: boolean
    whatsappPaid: boolean
  }
  date: string
  startTime: string
  status: string
  totalPrice: number
}

interface CustomerStats {
  totalOrders: number
  totalBookings: number
  totalSpent: number
  favoriteProducts: number
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { format, currency } = useCurrencyContext()
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalBookings: 0,
    totalSpent: 0,
    favoriteProducts: 0
  })
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== UserRole.CUSTOMER) {
      router.push("/")
      return
    }

    // Simular carga de datos
    const loadData = async () => {
      // Aquí irían las llamadas API reales
      setTimeout(() => {
        setStats({
          totalOrders: 12,
          totalBookings: 8,
          totalSpent: 1794.50, // S/. 1,794.50 (aprox $485 USD)
          favoriteProducts: 5
        })
        
        setProducts([
          { 
            id: "1", 
            name: "Comida premium para perros", 
            description: "Alimento balanceado de alta calidad", 
            price: 95.99, // S/. 95.99 (aprox $26 USD)
            stock: 50, 
            seller: { storeName: "Pet Store Pro", phone: "+1234567890" },
            rating: 4.5
          },
          { 
            id: "2", 
            name: "Juguete interactivo para gatos", 
            description: "Mantén a tu gato entretenido", 
            price: 48.99, // S/. 48.99 (aprox $13 USD)
            stock: 30, 
            seller: { storeName: "Cat Paradise", phone: "+1234567891" },
            rating: 4.8
          },
          { 
            id: "3", 
            name: "Correa ajustable", 
            description: "Correa resistente y cómoda", 
            price: 68.50, // S/. 68.50 (aprox $18 USD)
            stock: 15, 
            seller: { storeName: "Dog Essentials", phone: "+1234567892" },
            rating: 4.2
          }
        ])
        
        setServices([
          { 
            id: "1", 
            name: "Paseo básico", 
            description: "Paseo de 30 minutos", 
            price: 55.00, // S/. 55.00 (aprox $15 USD)
            duration: 30, 
            walker: { 
              name: "Carlos Rodríguez", 
              averageRating: 4.8, 
              phone: "+1234567893",
              whatsapp: "+1234567893",
              whatsappEnabled: true,
              whatsappPaid: true
            }
          },
          { 
            id: "2", 
            name: "Paseo extendido", 
            description: "Paseo de 60 minutos", 
            price: 92.50, // S/. 92.50 (aprox $25 USD)
            duration: 60, 
            walker: { 
              name: "María García", 
              averageRating: 4.9, 
              phone: "+1234567894",
              whatsapp: "+1234567894",
              whatsappEnabled: false,
              whatsappPaid: false
            }
          },
          { 
            id: "3", 
            name: "Paseo premium", 
            description: "Paseo de 90 minutos con entrenamiento", 
            price: 148.00, // S/. 148.00 (aprox $40 USD)
            duration: 90, 
            walker: { 
              name: "Juan Pérez", 
              averageRating: 4.7, 
              phone: "+1234567895",
              whatsapp: "+1234567895",
              whatsappEnabled: true,
              whatsappPaid: true
            }
          }
        ])
        
        setOrders([
          { id: "1", orderNumber: "ORD-001", totalAmount: 290.50, status: "COMPLETED", createdAt: "2024-01-15" },
          { id: "2", orderNumber: "ORD-002", totalAmount: 166.50, status: "PROCESSING", createdAt: "2024-01-18" },
          { id: "3", orderNumber: "ORD-003", totalAmount: 95.99, status: "PENDING", createdAt: "2024-01-20" }
        ])
        
        setBookings([
          { 
            id: "1", 
            service: { name: "Paseo básico" }, 
            walker: { 
              name: "Carlos Rodríguez", 
              phone: "+1234567893",
              whatsapp: "+1234567893",
              whatsappEnabled: true,
              whatsappPaid: true
            }, 
            date: "2024-01-22", 
            startTime: "10:00", 
            status: "COMPLETED", 
            totalPrice: 55.00 
          },
          { 
            id: "2", 
            service: { name: "Paseo extendido" }, 
            walker: { 
              name: "María García", 
              phone: "+1234567894",
              whatsapp: "+1234567894",
              whatsappEnabled: false,
              whatsappPaid: false
            }, 
            date: "2024-01-25", 
            startTime: "15:00", 
            status: "CONFIRMED", 
            totalPrice: 92.50 
          },
          { 
            id: "3", 
            service: { name: "Paseo premium" }, 
            walker: { 
              name: "Juan Pérez", 
              phone: "+1234567895",
              whatsapp: "+1234567895",
              whatsappEnabled: true,
              whatsappPaid: true
            }, 
            date: "2024-01-28", 
            startTime: "09:00", 
            status: "BOOKED", 
            totalPrice: 148.00 
          }
        ])
        
        setLoading(false)
      }, 1000)
    }

    loadData()
  }, [session, status, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completado</Badge>
      case "PROCESSING":
      case "CONFIRMED":
        return <Badge variant="outline">En proceso</Badge>
      case "PENDING":
      case "BOOKED":
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Cliente</h1>
          <p className="text-gray-600 mt-2">
            Encuentra productos y servicios para tus mascotas
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Órdenes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <p className="text-xs text-gray-600">
                Compras realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reservas
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-600">
                Servicios contratados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Gastado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {format(stats.totalSpent)}
              </div>
              <p className="text-xs text-gray-600">
                En productos y servicios
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Favoritos
              </CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.favoriteProducts}</div>
              <p className="text-xs text-gray-600">
                Productos favoritos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="orders">Mis Órdenes</TabsTrigger>
            <TabsTrigger value="bookings">Mis Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Productos Destacados</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {product.seller.storeName}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-orange-600 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        {format(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </span>
                      {product.stock > 0 ? (
                        <Badge variant="default" className="text-xs">Disponible</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Agotado</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="mr-1 h-3 w-3" />
                        Favorito
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Comprar
                      </Button>
                    </div>
                    {product.seller.phone && (
                      <div className="mt-2">
                        <WhatsAppButton 
                          phoneNumber={product.seller.phone}
                          message={`Hola, estoy interesado en el producto: ${product.name}`}
                          size="sm"
                          className="w-full"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Servicios de Paseo</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  Cerca de mí
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-orange-600 fill-current" />
                        <span className="text-sm font-medium">{service.walker.averageRating}</span>
                      </div>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Paseador</span>
                        <span className="text-sm font-medium">{service.walker.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duración</span>
                        <span className="text-sm font-medium">{service.duration} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Precio</span>
                        <span className="text-lg font-semibold text-green-600">
                          {format(service.price)}
                        </span>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        Reservar
                      </Button>
                      {service.walker.whatsapp && (
                        <div className="mt-2">
                          <WhatsAppButton 
                            phoneNumber={service.walker.whatsapp}
                            message={`Hola, estoy interesado en el servicio: ${service.name}`}
                            size="sm"
                            className="w-full"
                            isAuthorized={service.walker.whatsappEnabled && service.walker.whatsappPaid}
                            showUnauthorized={true}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Mis Órdenes
                </CardTitle>
                <CardDescription>
                  Historial de tus compras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {format(order.totalAmount)} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mis Reservas
                </CardTitle>
                <CardDescription>
                  Tus reservas de servicios de paseo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Dog className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.service.name}</p>
                          <p className="text-sm text-gray-600">
                            {booking.walker.name} • {booking.date} {booking.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-xs text-gray-600 mt-1">
                            {format(booking.totalPrice)}
                          </p>
                        </div>
                        {booking.walker.whatsapp && (
                          <WhatsAppButton 
                            phoneNumber={booking.walker.whatsapp}
                            message={`Hola, tengo una reserva para el servicio: ${booking.service.name} el día ${booking.date} a las ${booking.startTime}`}
                            size="sm"
                            isAuthorized={booking.walker.whatsappEnabled && booking.walker.whatsappPaid}
                            showUnauthorized={true}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <WhatsAppFloat />
    </div>
  )
}