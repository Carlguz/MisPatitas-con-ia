# 🚀 Funcionalidades Completas - PetConnect Platform

## 📋 Tabla de Contenido

1. [Sistema de Límites y Control](#sistema-de-límites-y-control)
2. [Sistema de Insignias (Badges)](#sistema-de-insignias-badges)
3. [Sistema de Verificación de Documentos](#sistema-de-verificación-de-documentos)
4. [Sistema de Valoración Avanzado](#sistema-de-valoración-avanzado)
5. [Productos y Servicios Recomendados](#productos-y-servicios-recomendados)
6. [Sistema de Verificación de Entrega](#sistema-de-verificación-de-entrega)
7. [Sistema de Pagos a Vendedores/Paseadores](#sistema-de-pagos-a-vendedorespaseadores)
8. [Sistema de Banners y Anuncios](#sistema-de-banners-y-anuncios)
9. [Sistema de Analytics](#sistema-de-analytics)
10. [Configuración de Página](#configuración-de-página)

---

## 🎯 Sistema de Límites y Control

### ✅ Características Implementadas:

#### 1. **Límites de Productos por Vendedor**
- **Límite configurable**: Cada vendedor tiene un límite de productos (por defecto: 50)
- **Control por categoría**: Cada categoría tiene su propio límite (por defecto: 100)
- **Contador automático**: Sistema lleva registro de productos creados por vendedor

#### 2. **Control de Productos Mostrados**
- **Configuración por página**: Define cuántos productos mostrar en cada sección
- **Productos destacados**: Sistema para marcar productos como destacados
- **Productos recomendados**: Sistema de recomendación automático y manual

### 📊 APIs Disponibles:

#### GET `/api/sellers/limits`
```json
{
  "success": true,
  "limits": {
    "maxProducts": 50,
    "currentProducts": 3,
    "remainingProducts": 47,
    "commissionRate": 10.00
  }
}
```

#### GET `/api/page/settings/home`
```json
{
  "success": true,
  "settings": {
    "featured_products_count": "8",
    "recommended_products_count": "12",
    "featured_services_count": "6",
    "recommended_services_count": "8",
    "show_featured_products": "true",
    "show_recommended_products": "true"
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para mostrar límites de vendedor
export function SellerLimits() {
  const [limits, setLimits] = useState(null)
  
  useEffect(() => {
    fetch('/api/sellers/limits')
      .then(res => res.json())
      .then(data => setLimits(data.limits))
  }, [])
  
  if (!limits) return <div>Cargando...</div>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tus Límites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Productos creados:</span>
            <span>{limits.currentProducts}/{limits.maxProducts}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(limits.currentProducts/limits.maxProducts)*100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Puedes crear {limits.remainingProducts} productos más
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🏆 Sistema de Insignias (Badges)

### ✅ Características Implementadas:

#### 1. **Tipos de Insignias**
- **VERIFIED**: Vendedor/Paseador verificado
- **TOP_SELLER**: Vendedor con más ventas
- **TOP_WALKER**: Paseador con más servicios
- **EXPERIENCE**: Por años de experiencia
- **CERTIFIED**: Por certificaciones
- **RELIABLE**: Por calificación alta
- **FAST_DELIVERY**: Por entrega rápida

#### 2. **Sistema Automático de Asignación**
- **Requisitos configurables**: Cada insignia tiene requisitos JSON
- **Asignación automática**: Sistema revisa requisitos periódicamente
- **Expiración**: Algunas insignias pueden expirar

### 📊 APIs Disponibles:

#### GET `/api/badges`
```json
{
  "success": true,
  "badges": [
    {
      "id": "uuid",
      "name": "Vendedor Verificado",
      "description": "Vendedor con documentos verificados",
      "badgeType": "VERIFIED",
      "icon": "/badges/verified.svg",
      "color": "#4CAF50",
      "requirements": {
        "documentVerification": true
      }
    }
  ]
}
```

#### GET `/api/users/[userId]/badges`
```json
{
  "success": true,
  "badges": [
    {
      "id": "uuid",
      "badgeId": "uuid",
      "badge": {
        "name": "Vendedor Verificado",
        "icon": "/badges/verified.svg",
        "color": "#4CAF50"
      },
      "awardedAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para mostrar insignias de usuario
export function UserBadges({ userId }) {
  const [badges, setBadges] = useState([])
  
  useEffect(() => {
    fetch(`/api/users/${userId}/badges`)
      .then(res => res.json())
      .then(data => setBadges(data.badges))
  }, [userId])
  
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((userBadge) => (
        <Badge 
          key={userBadge.id}
          variant="secondary"
          className="flex items-center gap-1"
          style={{ backgroundColor: userBadge.badge.color + '20' }}
        >
          <img 
            src={userBadge.badge.icon} 
            alt={userBadge.badge.name}
            className="w-4 h-4"
          />
          {userBadge.badge.name}
        </Badge>
      ))}
    </div>
  )
}
```

---

## 📋 Sistema de Verificación de Documentos

### ✅ Características Implementadas:

#### 1. **Tipos de Documentos**
- **DNI**: Documento nacional de identidad
- **PASSPORT**: Pasaporte
- **LICENSE**: Licencia
- **CERTIFICATE**: Certificado
- **DEGREE**: Título profesional

#### 2. **Flujo de Verificación**
- **Subida de documentos**: Los usuarios suben imágenes de sus documentos
- **Revisión por admin**: Los administradores revisan y aprueban/rechazan
- **Notificaciones**: Sistema notifica a los usuarios sobre el estado

#### 3. **Certificaciones**
- **Certificados profesionales**: Para paseadores y vendedores
- **Verificación de estudios**: Sistema para validar títulos y certificados
- **Fecha de vencimiento**: Algunos certificados pueden expirar

### 📊 APIs Disponibles:

#### POST `/api/users/documents`
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "documentType": "DNI",
    "documentNumber": "12345678",
    "documentImage": "/documents/dni-123.jpg",
    "verificationStatus": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/users/certifications`
```json
{
  "success": true,
  "certification": {
    "id": "uuid",
    "certificationName": "Primeros Auxilios Caninos",
    "issuingInstitution": "Veterinaria XYZ",
    "certificateImage": "/certificates/first-aid.jpg",
    "verificationStatus": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/admin/documents/[id]/verify`
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "verificationStatus": "APPROVED",
    "verificationNotes": "Documento verificado correctamente",
    "verifiedBy": "admin-id",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para subir documentos
export function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  
  const handleUpload = async (file: File, type: string) => {
    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', type)
    
    const response = await fetch('/api/users/documents', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      alert('Documento subido exitosamente')
    }
    
    setUploading(false)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">DNI</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0], 'DNI')}
              disabled={uploading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Certificado</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0], 'CERTIFICATE')}
              disabled={uploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## ⭐ Sistema de Valoración Avanzado

### ✅ Características Implementadas:

#### 1. **Sistema de Reviews Mejorado**
- **Calificación por estrellas**: Sistema de 1-5 estrellas
- **Comentarios detallados**: Los usuarios pueden dejar comentarios extensos
- **Imágenes en reviews**: Los usuarios pueden subir imágenes
- **Reviews verificadas**: Sistema para marcar reviews como verificadas

#### 2. **Sistema de "Útil"**
- **Votos de utilidad**: Los usuarios pueden marcar reviews como útiles
- **Contador de útiles**: Muestra cuántas personas encontraron útil la review
- **Ordenamiento**: Las reviews más útiles aparecen primero

#### 3. **Calificación Promedio**
- **Cálculo automático**: Sistema calcula promedio de calificaciones
- **Por producto/servicio**: Cada producto y servicio tiene su propia calificación
- **Por vendedor/paseador**: Calificación general del vendedor/paseador

### 📊 APIs Disponibles:

#### GET `/api/products/[id]/reviews`
```json
{
  "success": true,
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "name": "Juan Cliente",
        "avatar": "/avatars/juan.jpg"
      },
      "rating": 5,
      "comment": "Excelente producto, mi perro lo ama",
      "images": ["/reviews/review1.jpg"],
      "isVerified": true,
      "helpfulCount": 12,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25
}
```

#### POST `/api/reviews`
```json
{
  "success": true,
  "review": {
    "id": "uuid",
    "productId": "uuid",
    "rating": 5,
    "comment": "Excelente producto",
    "images": ["/reviews/review1.jpg"],
    "isVerified": false,
    "helpfulCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/reviews/[id]/helpful`
```json
{
  "success": true,
  "helpfulCount": 13
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para mostrar reviews
export function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  
  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
      })
  }, [productId])
  
  const handleHelpful = async (reviewId: string) => {
    const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST'
    })
    
    if (response.ok) {
      // Actualizar contador
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + 1 }
          : review
      ))
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold">{averageRating}</div>
        <div>
          <div className="flex">★★★★★</div>
          <div className="text-sm text-gray-600">
            Basado en {reviews.length} reseñas
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar>
                  <AvatarImage src={review.user.avatar} />
                  <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.user.name}</div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-2">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {review.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Review ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpful(review.id)}
                >
                  👍 Útil ({review.helpfulCount})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Productos y Servicios Recomendados

### ✅ Características Implementadas:

#### 1. **Tipos de Recomendaciones**
- **POPULAR**: Productos/servicios más populares
- **TRENDING**: Tendencias actuales
- **NEW**: Productos/servicios nuevos
- **FEATURED**: Destacados por administradores
- **SIMILAR**: Similares a los que el usuario ha visto

#### 2. **Sistema Automático**
- **Basado en ventas**: Productos más vendidos
- **Basado en vistas**: Productos más vistos
- **Basado en calificación**: Mejor calificados
- **Basado en comportamiento**: Recomendaciones personalizadas

#### 3. **Control Administrativo**
- **Destacar manualmente**: Los administradores pueden destacar productos
- **Prioridad configurable**: Orden de aparición
- **Fechas programadas**: Activar/desactivar recomendaciones

### 📊 APIs Disponibles:

#### GET `/api/products/recommended`
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Alimento Premium para Perros",
      "price": 95.99,
      "rating": 4.5,
      "image": "/products/premium-food.jpg",
      "recommendationType": "FEATURED",
      "priority": 1
    }
  ]
}
```

#### GET `/api/services/recommended`
```json
{
  "success": true,
  "services": [
    {
      "id": "uuid",
      "name": "Paseo Básico",
      "price": 55.00,
      "rating": 4.8,
      "walker": {
        "name": "Carlos Rodríguez",
        "rating": 4.9
      },
      "recommendationType": "POPULAR",
      "priority": 1
    }
  ]
}
```

#### POST `/api/admin/recommended-products`
```json
{
  "success": true,
  "recommendedProduct": {
    "id": "uuid",
    "productId": "uuid",
    "recommendationType": "FEATURED",
    "priority": 1,
    "isActive": true
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para mostrar productos recomendados
export function RecommendedProducts() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    fetch('/api/products/recommended')
      .then(res => res.json())
      .then(data => setProducts(data.products))
  }, [])
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Productos Recomendados</h2>
          <p className="text-gray-600">Los mejores productos para tu mascota</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 right-2">
                    {product.recommendationType}
                  </Badge>
                </div>
                
                <h3 className="font-medium mb-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-orange-600">
                    S/. {product.price}
                  </span>
                  <Button size="sm">Ver Detalles</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## ✅ Sistema de Verificación de Entrega

### ✅ Características Implementadas:

#### 1. **Verificación de Órdenes**
- **Confirmación de entrega**: Los clientes confirman cuando reciben el producto
- **Fotos de entrega**: Opcional: subir fotos del producto recibido
- **Comentarios**: Los clientes pueden dejar comentarios sobre la entrega

#### 2. **Verificación de Servicios**
- **Confirmación de servicio**: Los clientes confirman cuando el servicio se completó
- **Calificación del servicio**: Sistema de calificación para servicios
- **Feedback detallado**: Comentarios sobre la calidad del servicio

#### 3. **Sistema de Pagos**
- **Pago a vendedores**: Los vendedores reciben pago después de la verificación
- **Pago a paseadores**: Los paseadores reciben pago después de la verificación
- **Retenciones**: Sistema de comisiones automático

### 📊 APIs Disponibles:

#### POST `/api/orders/[id]/verify-delivery`
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "deliveryVerified": true,
    "deliveryVerifiedAt": "2024-01-01T00:00:00.000Z",
    "deliveryVerifiedBy": "customer-id",
    "sellerPaid": true,
    "sellerPaidAt": "2024-01-01T00:00:00.000Z",
    "sellerPaidAmount": 86.39
  }
}
```

#### POST `/api/bookings/[id]/verify-service`
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "serviceVerified": true,
    "serviceVerifiedAt": "2024-01-01T00:00:00.000Z",
    "serviceVerifiedBy": "customer-id",
    "walkerPaid": true,
    "walkerPaidAt": "2024-01-01T00:00:00.000Z",
    "walkerPaidAmount": 49.50
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para verificar entrega
export function DeliveryVerification({ orderId }) {
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  
  const handleVerify = async () => {
    setVerifying(true)
    
    const response = await fetch(`/api/orders/${orderId}/verify-delivery`, {
      method: 'POST'
    })
    
    if (response.ok) {
      setVerified(true)
      alert('Entrega verificada exitosamente')
    }
    
    setVerifying(false)
  }
  
  if (verified) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Entrega Verificada</AlertTitle>
        <AlertDescription>
          La entrega ha sido verificada y el vendedor recibirá el pago.
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificar Entrega</CardTitle>
        <CardDescription>
          Confirma que has recibido el producto para que podamos pagar al vendedor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleVerify}
          disabled={verifying}
          className="w-full"
        >
          {verifying ? 'Verificando...' : 'Verificar Entrega'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 💰 Sistema de Pagos a Vendedores/Paseadores

### ✅ Características Implementadas:

#### 1. **Sistema de Retiros**
- **Solicitud de retiros**: Los vendedores/paseadores solicitan retiros
- **Métodos de pago**: Transferencia bancaria, PayPal, Stripe
- **Comisiones automáticas**: Sistema calcula comisiones automáticamente

#### 2. **Control Administrativo**
- **Aprobación de retiros**: Los administradores aprueban los retiros
- **Historial de transacciones**: Registro completo de todos los pagos
- **Reportes financieros**: Reportes de pagos y comisiones

#### 3. **Saldo en Tiempo Real**
- **Saldo disponible**: Los usuarios ven su saldo disponible
- **Saldo pendiente**: Dinero pendiente de verificación
- **Historial de movimientos**: Registro completo de movimientos

### 📊 APIs Disponibles:

#### GET `/api/sellers/balance`
```json
{
  "success": true,
  "balance": {
    "available": 1500.00,
    "pending": 500.00,
    "totalEarned": 2000.00,
    "totalWithdrawn": 500.00,
    "commissionRate": 10.00
  }
}
```

#### POST `/api/sellers/withdrawals`
```json
{
  "success": true,
  "withdrawal": {
    "id": "uuid",
    "amount": 500.00,
    "method": "bank_transfer",
    "accountInfo": {
      "bank": "BCP",
      "accountNumber": "123456789",
      "accountHolder": "Juan Vendedor"
    },
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/admin/withdrawals`
```json
{
  "success": true,
  "withdrawals": [
    {
      "id": "uuid",
      "seller": {
        "name": "Juan Vendedor",
        "email": "seller@petconnect.com"
      },
      "amount": 500.00,
      "method": "bank_transfer",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente para saldo y retiros
export function SellerBalance() {
  const [balance, setBalance] = useState(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  
  useEffect(() => {
    fetch('/api/sellers/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance))
  }, [])
  
  const handleWithdraw = async () => {
    setWithdrawing(true)
    
    const response = await fetch('/api/sellers/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(withdrawAmount),
        method: 'bank_transfer',
        accountInfo: {
          bank: 'BCP',
          accountNumber: '123456789',
          accountHolder: 'Juan Vendedor'
        }
      })
    })
    
    if (response.ok) {
      alert('Solicitud de retiro enviada')
      setWithdrawAmount('')
      // Recargar saldo
      fetch('/api/sellers/balance')
        .then(res => res.json())
        .then(data => setBalance(data.balance))
    }
    
    setWithdrawing(false)
  }
  
  if (!balance) return <div>Cargando...</div>
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-green-600">
              S/. {balance.available.toFixed(2)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Pendiente:</span>
                <span className="ml-2 font-medium">S/. {balance.pending.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Ganado:</span>
                <span className="ml-2 font-medium">S/. {balance.totalEarned.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Solicitar Retiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Monto a retirar
              </label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={balance.available}
              />
            </div>
            
            <Button 
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) > balance.available}
              className="w-full"
            >
              {withdrawing ? 'Procesando...' : 'Solicitar Retiro'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎪 Sistema de Banners y Anuncios

### ✅ Características Implementadas:

#### 1. **Banners Publicitarios**
- **Carrusel de banners**: Sistema de banners rotativos
- **Posicionamiento configurable**: Orden de aparición
- **Fechas programadas**: Activar/desactivar banners por fechas

#### 2. **Anuncios Contextuales**
- **Anuncios por categoría**: Anuncios específicos para cada categoría
- **Anuncios por marca**: Anuncios de marcas patrocinadoras
- **Contadores de clics**: Seguimiento de efectividad

#### 3. **Estadísticas**
- **Contador de vistas**: Cuántas veces se vio el anuncio
- **Contador de clics**: Cuántas veces se hizo clic
- **Tasa de CTR**: Cálculo de efectividad

### 📊 APIs Disponibles:

#### GET `/api/banners`
```json
{
  "success": true,
  "banners": [
    {
      "id": "uuid",
      "title": "Oferta Especial",
      "description": "20% de descuento en alimentos premium",
      "image": "/images/banners/sale-banner.jpg",
      "link": "/ofertas",
      "position": 1,
      "isActive": true
    }
  ]
}
```

#### GET `/api/ads/category/[categoryId]`
```json
{
  "success": true,
  "ads": [
    {
      "id": "uuid",
      "title": "Alimento para Gatos",
      "description": "Comida premium para gatos",
      "image": "/images/ads/cat-food.jpg",
      "link": "/productos/gatos",
      "type": "category",
      "viewCount": 1500,
      "clickCount": 45,
      "ctr": 3.0
    }
  ]
}
```

#### POST `/api/ads/[id]/click`
```json
{
  "success": true,
  "clickCount": 46
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente de carrusel de banners
export function BannerCarousel() {
  const [banners, setBanners] = useState([])
  const [currentBanner, setCurrentBanner] = useState(0)
  
  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => setBanners(data.banners))
  }, [])
  
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }
  
  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }
  
  const handleBannerClick = async (banner) => {
    // Registrar clic
    await fetch(`/api/ads/${banner.id}/click`, { method: 'POST' })
    
    // Redirigir al enlace
    window.location.href = banner.link
  }
  
  if (banners.length === 0) return null
  
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentBanner ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handleBannerClick(banner)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white cursor-pointer" onClick={() => handleBannerClick(banner)}>
              <h2 className="text-4xl font-bold mb-4">{banner.title}</h2>
              <p className="text-xl mb-6">{banner.description}</p>
              <Button size="lg">Ver Más</Button>
            </div>
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2"
        onClick={prevBanner}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
        onClick={nextBanner}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

---

## 📊 Sistema de Analytics

### ✅ Características Implementadas:

#### 1. **Eventos Personalizados**
- **Seguimiento de eventos**: Registro de acciones de usuarios
- **Metadatos flexibles**: Información adicional en cada evento
- **Sesiones de usuario**: Seguimiento por sesión

#### 2. **Estadísticas en Tiempo Real**
- **Vistas de productos**: Contador de vistas por producto
- **Vistas de servicios**: Contador de vistas por servicio
- **Interacciones del usuario**: Registro de todas las interacciones

#### 3. **Reportes**
- **Reportes diarios**: Estadísticas diarias
- **Reportes por usuario**: Actividad por usuario
- **Reportes por producto**: Popularidad de productos

### 📊 APIs Disponibles:

#### POST `/api/analytics/events`
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "event": "product_view",
    "page": "/products/123",
    "userId": "user-id",
    "sessionId": "session-id",
    "metadata": {
      "productId": "123",
      "productName": "Alimento Premium para Perros"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/analytics/reports/products`
```json
{
  "success": true,
  "report": {
    "totalViews": 15000,
    "uniqueViewers": 3200,
    "topProducts": [
      {
        "id": "uuid",
        "name": "Alimento Premium para Perros",
        "views": 1500,
        "uniqueViewers": 450
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Hook para tracking de analytics
export function useAnalytics() {
  const trackEvent = async (event: string, metadata: any = {}) => {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          page: window.location.pathname,
          metadata
        })
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }
  
  const trackProductView = (product: any) => {
    trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      categoryId: product.categoryId
    })
  }
  
  const trackServiceView = (service: any) => {
    trackEvent('service_view', {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      walkerId: service.walkerId
    })
  }
  
  const trackPurchase = (order: any) => {
    trackEvent('purchase', {
      orderId: order.id,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod
    })
  }
  
  return {
    trackEvent,
    trackProductView,
    trackServiceView,
    trackPurchase
  }
}

// Componente con tracking integrado
export function ProductCard({ product }) {
  const { trackProductView } = useAnalytics()
  
  useEffect(() => {
    trackProductView(product)
  }, [product, trackProductView])
  
  return (
    <Card>
      <CardContent className="p-4">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h3 className="font-medium mb-2">{product.name}</h3>
        <div className="text-lg font-bold text-orange-600">
          S/. {product.price}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## ⚙️ Configuración de Página

### ✅ Características Implementadas:

#### 1. **Configuración Dinámica**
- **Títulos y subtítulos**: Configurar textos de la página
- **Imágenes**: Cambiar imágenes de fondo y banners
- **Mostrar/ocultar secciones**: Control de visibilidad de secciones

#### 2. **Contenido Personalizable**
- **Contadores configurables**: Número de elementos a mostrar
- **Colores y temas**: Personalización visual
- **Layouts**: Diferentes disposiciones de contenido

#### 3. **Multi-idioma**
- **Textos traducibles**: Sistema para múltiples idiomas
- **Configuración regional**: Formatos de fecha y moneda
- **Contenido localizado**: Contenido específico por región

### 📊 APIs Disponibles:

#### GET `/api/page/settings/[page]`
```json
{
  "success": true,
  "settings": {
    "hero_title": "Conectamos Amantes de Mascotas",
    "hero_subtitle": "La plataforma completa para paseadores de mascotas, vendedores de productos y clientes. Todo en un solo lugar.",
    "hero_image": "/images/hero-bg.jpg",
    "show_featured_products": "true",
    "featured_products_count": "8",
    "show_recommended_services": "true",
    "recommended_services_count": "8"
  }
}
```

#### PUT `/api/admin/page/settings/[page]`
```json
{
  "success": true,
  "settings": {
    "hero_title": "Nuevo Título",
    "hero_subtitle": "Nuevo subtítulo",
    "show_featured_products": "false",
    "featured_products_count": "12"
  }
}
```

### 💻 Ejemplo de Uso:

```tsx
// Componente de página con configuración dinámica
export function HomePage() {
  const [settings, setSettings] = useState(null)
  
  useEffect(() => {
    fetch('/api/page/settings/home')
      .then(res => res.json())
      .then(data => setSettings(data.settings))
  }, [])
  
  if (!settings) return <div>Cargando...</div>
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Hero Section con configuración dinámica */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${settings.hero_image})` }}
        />
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {settings.hero_title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              {settings.hero_subtitle}
            </p>
          </div>
        </div>
      </section>
      
      {/* Productos Destacados (solo si está habilitado) */}
      {settings.show_featured_products === 'true' && (
        <FeaturedProducts 
          count={parseInt(settings.featured_products_count)}
        />
      )}
      
      {/* Servicios Recomendados (solo si está habilitado) */}
      {settings.show_recommended_services === 'true' && (
        <RecommendedServices 
          count={parseInt(settings.recommended_services_count)}
        />
      )}
    </div>
  )
}
```

---

## 🎯 Resumen de Funcionalidades

### ✅ **TODO IMPLEMENTADO:**

| Funcionalidad | Estado | Detalles |
|---------------|--------|----------|
| Límites de productos | ✅ | Por vendedor y categoría |
| Sistema de insignias | ✅ | 8 tipos de insignias con requisitos |
| Verificación de documentos | ✅ | DNI, pasaporte, certificados |
| Sistema de valoración | ✅ | Reviews con imágenes y votos útiles |
| Productos recomendados | ✅ | 5 tipos de recomendaciones |
| Verificación de entrega | ✅ | Para productos y servicios |
| Pagos a vendedores | ✅ | Sistema de retiros y comisiones |
| Banners y anuncios | ✅ | Carrusel y anuncios contextuales |
| Analytics | ✅ | Tracking de eventos y reportes |
| Configuración de página | ✅ | Contenido dinámico y personalizable |

### 🚀 **CARACTERÍSTICAS AVANZADAS:**

- **Sistema de seguridad completo**: Verificación de identidad, documentos, certificados
- **Sistema de confianza**: Insignias, verificaciones, calificaciones
- **Sistema de monetización**: Comisiones, retiros, pagos automáticos
- **Sistema de marketing**: Banners, anuncios, recomendaciones
- **Sistema de análisis**: Analytics, reportes, estadísticas
- **Sistema de personalización**: Configuración dinámica, temas, contenidos

### 📋 **DATOS QUE SE PIDEN A LOS USUARIOS:**

#### **Para Clientes:**
- ✅ Nombre y email
- ✅ Teléfono
- ✅ Dirección
- ✅ DNI (documento de identidad)

#### **Para Vendedores:**
- ✅ Nombre de la tienda
- ✅ Descripción del negocio
- ✅ Dirección comercial
- ✅ Teléfono comercial
- ✅ Logo de la tienda
- ✅ Documentos de verificación (DNI, licencia)
- ✅ Certificados profesionales
- ✅ Sitio web y redes sociales

#### **Para Paseadores:**
- ✅ Nombre completo
- ✅ Descripción profesional
- ✅ Experiencia (años)
- ✅ Precio por hora
- ✅ Dirección
- ✅ Teléfono y WhatsApp
- ✅ Documentos de verificación (DNI)
- ✅ Certificados (primeros auxilios, cuidado de mascotas)
- ✅ Redes sociales

### 🎯 **INSIGNIAS DISPONIBLES:**

1. **Vendedor Verificado** - Documentos verificados
2. **Paseador Verificado** - Documentos y certificados verificados
3. **Top Vendedor** - Más de 100 ventas
4. **Top Paseador** - Más de 50 servicios completados
5. **Experto en Mascotas** - Más de 5 años de experiencia
6. **Certificado Profesional** - Posee certificaciones
7. **Servicio Confiable** - Calificación mayor a 4.5
8. **Entrega Rápida** - Tiempo de entrega menor a 24 horas

### 🏆 **SISTEMA DE SEGURIDAD Y CONFIANZA:**

- **Verificación de identidad**: Documentos oficiales
- **Verificación de profesionales**: Certificados y títulos
- **Sistema de calificaciones**: Reviews verificadas
- **Sistema de insignias**: Reconocimiento de méritos
- **Verificación de entrega**: Confirmación de servicios
- **Sistema de pagos seguros**: Retiros controlados

---

## 🎉 **CONCLUSIÓN**

¡La plataforma PetConnect ahora tiene todas las funcionalidades que solicitaste y mucho más! El sistema está completo y listo para competir con plataformas como Dokan, con características avanzadas de:

- **Seguridad y confianza** completas
- **Monetización** profesional
- **Marketing** y publicidad
- **Análisis** y reportes
- **Personalización** total
- **Escalabilidad** empresarial

Todo está perfectamente integrado en la base de datos y las APIs están listas para ser consumidas por el frontend. 🚀