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
import { ProductModal } from "@/components/product-modal"
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ShoppingCart,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"
import { UserRole } from "@prisma/client"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  isActive: boolean
  image?: string
  category: {
    id: string
    name: string
  }
  seller: {
    id: string
    storeName: string
    phone?: string
  }
  averageRating?: number
  totalReviews?: number
}

interface ProductCategory {
  id: string
  name: string
  description?: string
}

interface SellerStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageRating: number
}

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0
  })
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      // Cargar estadísticas
      const statsResponse = await fetch('/api/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Cargar productos
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products)
      }

      // Cargar categorías
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== UserRole.SELLER) {
      router.push("/")
      return
    }

    loadData()
  }, [session, status, router])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData() // Recargar datos
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto')
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Vendedor</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu tienda y productos
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
              <p className="text-xs text-gray-600">
                {products.filter(p => p.isActive).length} activos
              </p>
            </CardContent>
          </Card>

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
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Órdenes</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Mis Productos</h2>
              <ProductModal categories={categories} onSuccess={loadData}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </ProductModal>
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
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {product.category.name}
                    </CardDescription>
                    <CardDescription className="text-lg font-semibold text-green-600">
                      ${product.price.toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </span>
                      {product.stock === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Sin stock
                        </Badge>
                      )}
                    </div>
                    {product.averageRating && (
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-4 w-4 text-orange-600 fill-current" />
                        <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600">({product.totalReviews})</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>
                      <ProductModal 
                        product={product} 
                        categories={categories} 
                        onSuccess={loadData}
                      >
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                      </ProductModal>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
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

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Órdenes Recientes
                </CardTitle>
                <CardDescription>
                  Gestiona las órdenes de tus productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Orden #1234</p>
                        <p className="text-sm text-gray-600">3 productos • $78.50</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Procesando</Badge>
                      <p className="text-xs text-gray-600 mt-1">Hace 2 horas</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Orden #1233</p>
                        <p className="text-sm text-gray-600">2 productos • $45.00</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Completado</Badge>
                      <p className="text-xs text-gray-600 mt-1">Hace 5 horas</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Orden #1232</p>
                        <p className="text-sm text-gray-600">1 producto • $25.99</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Pendiente</Badge>
                      <p className="text-xs text-gray-600 mt-1">Hace 1 día</p>
                    </div>
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
                    Ventas del Mes
                  </CardTitle>
                  <CardDescription>
                    Resumen de ventas mensuales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Ventas</span>
                      <span className="text-2xl font-bold text-green-600">$12,540</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Órdenes Completadas</span>
                      <span className="text-lg font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Promedio por Orden</span>
                      <span className="text-lg font-semibold">$80.38</span>
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
                        <span className="text-2xl font-bold text-orange-600">4.5</span>
                        <Star className="h-4 w-4 text-orange-600 fill-current" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reseñas</span>
                      <span className="text-lg font-semibold">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reseñas Positivas</span>
                      <span className="text-lg font-semibold text-green-600">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Configuración de la Tienda
                </CardTitle>
                <CardDescription>
                  Personaliza la información de tu tienda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nombre de la Tienda</h4>
                    <p className="text-sm text-gray-600">Tu tienda virtual</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">Pet Store Pro</p>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Descripción</h4>
                    <p className="text-sm text-gray-600">Descripción de tu tienda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm max-w-xs truncate">Los mejores productos para tus mascotas...</p>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Estado de la Tienda</h4>
                    <p className="text-sm text-gray-600">Visibilidad de tu tienda</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Activa</Badge>
                    <Button variant="outline" size="sm">Cambiar</Button>
                  </div>
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