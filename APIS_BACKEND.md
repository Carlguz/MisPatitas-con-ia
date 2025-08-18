# APIs de Backend - PetConnect Platform

## Documentación de APIs para conectar el frontend con el backend

---

## 1. APIs de Autenticación

### POST `/api/auth/[...nextauth]/route.ts`
**Descripción**: Configuración de NextAuth para autenticación
**Métodos**: GET, POST
**Uso**: Maneja inicio de sesión, registro y sesiones

### POST `/api/auth/register/route.ts`
**Descripción**: Registro de nuevos usuarios
**Método**: POST
**Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Usuario",
  "role": "CUSTOMER" // ADMIN, SELLER, WALKER, CUSTOMER
}
```
**Respuesta**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "role": "CUSTOMER"
  }
}
```

---

## 2. APIs de Usuarios

### GET `/api/health/route.ts`
**Descripción**: Verificar salud del servidor
**Método**: GET
**Respuesta**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. APIs de Productos

### GET `/api/products/route.ts`
**Descripción**: Obtener todos los productos
**Método**: GET
**Query Params**:
- `categoryId`: Filtrar por categoría (opcional)
- `sellerId`: Filtrar por vendedor (opcional)
- `search`: Buscar por nombre (opcional)

**Respuesta**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Alimento Premium para Perros",
      "description": "Comida balanceada para perros adultos",
      "price": 95.99,
      "stock": 50,
      "images": ["url1", "url2"],
      "isActive": true,
      "seller": {
        "id": "uuid",
        "storeName": "Mascotas Felices"
      },
      "category": {
        "id": "uuid",
        "name": "Alimentos para Mascotas"
      }
    }
  ]
}
```

### GET `/api/products/[id]/route.ts`
**Descripción**: Obtener producto por ID
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Alimento Premium para Perros",
    "description": "Comida balanceada para perros adultos",
    "price": 95.99,
    "stock": 50,
    "images": ["url1", "url2"],
    "isActive": true,
    "seller": {
      "id": "uuid",
      "storeName": "Mascotas Felices"
    },
    "category": {
      "id": "uuid",
      "name": "Alimentos para Mascotas"
    }
  }
}
```

---

## 4. APIs de Categorías

### GET `/api/categories/route.ts`
**Descripción**: Obtener todas las categorías
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "Alimentos para Mascotas",
      "description": "Comida balanceada y nutritiva para tus mascotas",
      "image": "/images/categories/food.jpg",
      "isActive": true
    }
  ]
}
```

### GET `/api/categories/[id]/route.ts`
**Descripción**: Obtener categoría por ID
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "category": {
    "id": "uuid",
    "name": "Alimentos para Mascotas",
    "description": "Comida balanceada y nutritiva para tus mascotas",
    "image": "/images/categories/food.jpg",
    "isActive": true
  }
}
```

---

## 5. APIs de Servicios (Paseadores)

### GET `/api/services/route.ts`
**Descripción**: Obtener todos los servicios
**Método**: GET
**Query Params**:
- `walkerId`: Filtrar por paseador (opcional)
- `status`: Filtrar por estado (opcional)

**Respuesta**:
```json
{
  "success": true,
  "services": [
    {
      "id": "uuid",
      "name": "Paseo Básico",
      "description": "Paseo de 30 minutos por el parque",
      "price": 55.00,
      "duration": 30,
      "isActive": true,
      "status": "AVAILABLE",
      "walker": {
        "id": "uuid",
        "name": "Carlos Rodríguez",
        "experience": 5,
        "pricePerHour": 55.00,
        "whatsapp": "+51987654321",
        "whatsappEnabled": true,
        "whatsappPaid": true
      }
    }
  ]
}
```

### GET `/api/services/[id]/route.ts`
**Descripción**: Obtener servicio por ID
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "service": {
    "id": "uuid",
    "name": "Paseo Básico",
    "description": "Paseo de 30 minutos por el parque",
    "price": 55.00,
    "duration": 30,
    "isActive": true,
    "status": "AVAILABLE",
    "walker": {
      "id": "uuid",
      "name": "Carlos Rodríguez",
      "experience": 5,
      "pricePerHour": 55.00,
      "whatsapp": "+51987654321",
      "whatsappEnabled": true,
      "whatsappPaid": true
    }
  }
}
```

---

## 6. APIs de Horarios

### GET `/api/schedules/route.ts`
**Descripción**: Obtener todos los horarios
**Método**: GET
**Query Params**:
- `walkerId`: Filtrar por paseador (opcional)

**Respuesta**:
```json
{
  "success": true,
  "schedules": [
    {
      "id": "uuid",
      "walkerId": "uuid",
      "dayOfWeek": 1, // Lunes
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    }
  ]
}
```

### GET/PUT/DELETE `/api/schedules/[id]/route.ts`
**Descripción**: CRUD de horarios por ID
**Métodos**: GET, PUT, DELETE

**PUT Body**:
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00",
  "isActive": true
}
```

---

## 7. APIs de WhatsApp (Paseadores)

### POST `/api/walkers/whatsapp/route.ts`
**Descripción**: Configurar WhatsApp de un paseador
**Método**: POST
**Body**:
```json
{
  "whatsapp": "+51987654321",
  "whatsappEnabled": true
}
```
**Respuesta**:
```json
{
  "success": true,
  "message": "Configuración de WhatsApp actualizada",
  "walker": {
    "id": "uuid",
    "whatsapp": "+51987654321",
    "whatsappEnabled": true,
    "whatsappPaid": false
  }
}
```

### POST `/api/walkers/whatsapp/pay/route.ts`
**Descripción**: Pagar por el servicio de WhatsApp
**Método**: POST
**Body**:
```json
{
  "walkerId": "uuid",
  "paymentMethod": "stripe" // o "paypal"
}
```
**Respuesta**:
```json
{
  "success": true,
  "message": "Pago del servicio de WhatsApp procesado",
  "walker": {
    "id": "uuid",
    "whatsapp": "+51987654321",
    "whatsappEnabled": true,
    "whatsappPaid": true
  },
  "payment": {
    "id": "uuid",
    "amount": 37.00,
    "method": "stripe",
    "status": "PAID"
  }
}
```

---

## 8. APIs de Órdenes

### GET `/api/orders/route.ts`
**Descripción**: Obtener todas las órdenes
**Método**: GET
**Query Params**:
- `customerId`: Filtrar por cliente (opcional)
- `status`: Filtrar por estado (opcional)

**Respuesta**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "ORD-2024-001",
      "customerId": "uuid",
      "totalAmount": 95.99,
      "status": "COMPLETED",
      "paymentStatus": "PAID",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 1,
          "price": 95.99,
          "subtotal": 95.99
        }
      ]
    }
  ]
}
```

### POST `/api/orders/route.ts`
**Descripción**: Crear nueva orden
**Método**: POST
**Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "price": 95.99
    }
  ],
  "notes": "Orden de prueba"
}
```

### GET/PUT/DELETE `/api/orders/[id]/route.ts`
**Descripción**: CRUD de órdenes por ID
**Métodos**: GET, PUT, DELETE

---

## 9. APIs de Reservas

### GET `/api/bookings/route.ts`
**Descripción**: Obtener todas las reservas
**Método**: GET
**Query Params**:
- `customerId`: Filtrar por cliente (opcional)
- `walkerId`: Filtrar por paseador (opcional)
- `status`: Filtrar por estado (opcional)

**Respuesta**:
```json
{
  "success": true,
  "bookings": [
    {
      "id": "uuid",
      "serviceId": "uuid",
      "customerId": "uuid",
      "walkerId": "uuid",
      "date": "2024-01-01T10:00:00.000Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "BOOKED",
      "totalPrice": 55.00,
      "service": {
        "id": "uuid",
        "name": "Paseo Básico",
        "price": 55.00
      },
      "walker": {
        "id": "uuid",
        "name": "Carlos Rodríguez"
      }
    }
  ]
}
```

### POST `/api/bookings/route.ts`
**Descripción**: Crear nueva reserva
**Método**: POST
**Body**:
```json
{
  "serviceId": "uuid",
  "date": "2024-01-01T10:00:00.000Z",
  "startTime": "10:00",
  "endTime": "10:30",
  "notes": "Reserva de prueba"
}
```

### GET/PUT/DELETE `/api/bookings/[id]/route.ts`
**Descripción**: CRUD de reservas por ID
**Métodos**: GET, PUT, DELETE

---

## 10. APIs de Enlaces Sociales

### GET `/api/social-links/route.ts`
**Descripción**: Obtener todos los enlaces sociales
**Método**: GET
**Query Params**:
- `walkerId`: Filtrar por paseador (opcional)

**Respuesta**:
```json
{
  "success": true,
  "socialLinks": [
    {
      "id": "uuid",
      "walkerId": "uuid",
      "platform": "instagram",
      "url": "https://instagram.com/usuario",
      "isActive": true
    }
  ]
}
```

### POST `/api/social-links/route.ts`
**Descripción**: Crear nuevo enlace social
**Método**: POST
**Body**:
```json
{
  "platform": "instagram",
  "url": "https://instagram.com/usuario"
}
```

### GET/PUT/DELETE `/api/social-links/[id]/route.ts`
**Descripción**: CRUD de enlaces sociales por ID
**Métodos**: GET, PUT, DELETE

---

## 11. APIs de Reviews

### GET `/api/reviews/route.ts`
**Descripción**: Obtener todas las reseñas
**Método**: GET
**Query Params**:
- `productId`: Filtrar por producto (opcional)
- `serviceId`: Filtrar por servicio (opcional)
- `walkerId`: Filtrar por paseador (opcional)

**Respuesta**:
```json
{
  "success": true,
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "productId": "uuid",
      "rating": 5,
      "comment": "Excelente producto",
      "isActive": true,
      "user": {
        "id": "uuid",
        "name": "Juan Cliente"
      }
    }
  ]
}
```

### POST `/api/reviews/route.ts`
**Descripción**: Crear nueva reseña
**Método**: POST
**Body**:
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente producto"
}
```

### GET/PUT/DELETE `/api/reviews/[id]/route.ts`
**Descripción**: CRUD de reseñas por ID
**Métodos**: GET, PUT, DELETE

---

## 12. APIs de Notificaciones

### GET `/api/notifications/route.ts`
**Descripción**: Obtener todas las notificaciones
**Método**: GET
**Query Params**:
- `userId`: Filtrar por usuario (opcional)
- `isRead`: Filtrar por leídas/no leídas (opcional)

**Respuesta**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Nueva reserva",
      "message": "Tienes una nueva reserva para el servicio de paseo",
      "type": "info",
      "isRead": false
    }
  ]
}
```

### POST `/api/notifications/route.ts`
**Descripción**: Crear nueva notificación
**Método**: POST
**Body**:
```json
{
  "title": "Nueva reserva",
  "message": "Tienes una nueva reserva para el servicio de paseo",
  "type": "info"
}
```

### GET/PUT/DELETE `/api/notifications/[id]/route.ts`
**Descripción**: CRUD de notificaciones por ID
**Métodos**: GET, PUT, DELETE

### POST `/api/notifications/mark-all-read/route.ts`
**Descripción**: Marcar todas las notificaciones como leídas
**Método**: POST
**Body**:
```json
{
  "userId": "uuid"
}
```

---

## 13. APIs de Estadísticas

### GET `/api/stats/route.ts`
**Descripción**: Obtener estadísticas generales
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "totalProducts": 50,
    "totalServices": 20,
    "totalOrders": 75,
    "totalBookings": 30,
    "totalRevenue": 15000.00
  }
}
```

---

## 14. APIs de Administración

### GET `/api/admin/dashboard/route.ts`
**Descripción**: Obtener datos del dashboard de administración
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "dashboard": {
    "users": {
      "total": 100,
      "admins": 5,
      "sellers": 20,
      "walkers": 30,
      "customers": 45
    },
    "products": {
      "total": 50,
      "active": 45,
      "inactive": 5
    },
    "services": {
      "total": 20,
      "available": 15,
      "booked": 5
    },
    "orders": {
      "total": 75,
      "pending": 10,
      "completed": 60,
      "cancelled": 5
    },
    "revenue": {
      "total": 15000.00,
      "thisMonth": 3000.00
    }
  }
}
```

---

## Configuración de Variables de Entorno

Para que las APIs funcionen correctamente, necesitas configurar estas variables de entorno:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secreto_aqui"

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID="tu_google_client_id"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Stripe (para pagos)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# WhatsApp (opcional)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

---

## Estructura de Respuestas

Todas las APIs siguen esta estructura de respuesta:

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Error
```json
{
  "success": false,
  "error": "Mensaje de error",
  "details": { ... }
}
```

### Códigos de Estado HTTP
- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Notas Importantes

1. **Autenticación**: La mayoría de las APIs requieren autenticación mediante tokens JWT o sesiones de NextAuth.

2. **Permisos**: Algunas APIs tienen restricciones basadas en roles de usuario (ADMIN, SELLER, WALKER, CUSTOMER).

3. **Validación**: Todos los datos de entrada son validados antes de ser procesados.

4. **Manejo de Errores**: Todas las APIs incluyen manejo de errores adecuado con mensajes descriptivos.

5. **Formato de Fechas**: Todas las fechas usan formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).

6. **Moneda**: Los precios se almacenan en Soles Peruanos (PEN) pero se pueden convertir a Dólares (USD) usando el tipo de cambio configurado.