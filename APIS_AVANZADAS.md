# 🚀 APIs Avanzadas - PetConnect Platform

## Documentación de APIs para Funcionalidades Avanzadas

---

## 📋 Tabla de Contenido

1. [APIs de Sistema de Límites](#apis-de-sistema-de-límites)
2. [APIs de Insignias (Badges)](#apis-de-insignias-badges)
3. [APIs de Verificación de Documentos](#apis-de-verificación-de-documentos)
4. [APIs de Valoración Avanzada](#apis-de-valoración-avanzada)
5. [APIs de Recomendaciones](#apis-de-recomendaciones)
6. [APIs de Verificación de Entrega](#apis-de-verificación-de-entrega)
7. [APIs de Pagos a Vendedores](#apis-de-pagos-a-vendedores)
8. [APIs de Banners y Anuncios](#apis-de-banners-y-anuncios)
9. [APIs de Analytics](#apis-de-analytics)
10. [APIs de Configuración de Página](#apis-de-configuración-de-página)

---

## 🎯 APIs de Sistema de Límites

### GET `/api/sellers/limits`
**Descripción**: Obtener límites de productos para un vendedor
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "limits": {
    "maxProducts": 50,
    "currentProducts": 3,
    "remainingProducts": 47,
    "commissionRate": 10.00,
    "totalSales": 1500.00,
    "totalProducts": 25
  }
}
```

### GET `/api/categories/[id]/limits`
**Descripción**: Obtener límites de productos para una categoría
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "limits": {
    "maxProducts": 100,
    "currentProducts": 15,
    "remainingProducts": 85
  }
}
```

### PUT `/api/admin/sellers/[id]/limits`
**Descripción**: Actualizar límites de un vendedor
**Método**: PUT
**Body**:
```json
{
  "maxProducts": 100,
  "commissionRate": 15.00
}
```
**Respuesta**:
```json
{
  "success": true,
  "seller": {
    "id": "uuid",
    "maxProducts": 100,
    "commissionRate": 15.00
  }
}
```

---

## 🏆 APIs de Insignias (Badges)

### GET `/api/badges`
**Descripción**: Obtener todas las insignias disponibles
**Método**: GET
**Respuesta**:
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
      },
      "isActive": true
    }
  ]
}
```

### GET `/api/users/[userId]/badges`
**Descripción**: Obtener insignias de un usuario
**Método**: GET
**Respuesta**:
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

### POST `/api/admin/badges`
**Descripción**: Crear nueva insignia
**Método**: POST
**Body**:
```json
{
  "name": "Nueva Insignia",
  "description": "Descripción de la insignia",
  "badgeType": "VERIFIED",
  "icon": "/badges/new-badge.svg",
  "color": "#FF6B35",
  "requirements": {
    "minSales": 50,
    "minRating": 4.0
  }
}
```
**Respuesta**:
```json
{
  "success": true,
  "badge": {
    "id": "uuid",
    "name": "Nueva Insignia",
    "badgeType": "VERIFIED",
    "isActive": true
  }
}
```

### POST `/api/admin/users/[userId]/badges/[badgeId]`
**Descripción**: Otorgar insignia a usuario
**Método**: POST
**Respuesta**:
```json
{
  "success": true,
  "userBadge": {
    "id": "uuid",
    "userId": "uuid",
    "badgeId": "uuid",
    "awardedAt": "2024-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

---

## 📋 APIs de Verificación de Documentos

### POST `/api/users/documents`
**Descripción**: Subir documento de verificación
**Método**: POST
**Body** (FormData):
```
file: [archivo]
documentType: DNI
documentNumber: 12345678
issueDate: 2020-01-01
expiryDate: 2025-01-01
```
**Respuesta**:
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

### GET `/api/users/[userId]/documents`
**Descripción**: Obtener documentos de un usuario
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "documentType": "DNI",
      "documentNumber": "12345678",
      "documentImage": "/documents/dni-123.jpg",
      "verificationStatus": "APPROVED",
      "verifiedBy": "admin-id",
      "verifiedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT `/api/admin/documents/[id]/verify`
**Descripción**: Verificar documento
**Método**: PUT
**Body**:
```json
{
  "verificationStatus": "APPROVED",
  "verificationNotes": "Documento verificado correctamente"
}
```
**Respuesta**:
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

### POST `/api/users/certifications`
**Descripción**: Subir certificación
**Método**: POST
**Body** (FormData):
```
file: [archivo]
certificationName: Primeros Auxilios Caninos
issuingInstitution: Veterinaria XYZ
issueDate: 2023-01-01
expiryDate: 2028-01-01
```
**Respuesta**:
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

### GET `/api/users/[userId]/certifications`
**Descripción**: Obtener certificaciones de un usuario
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "certifications": [
    {
      "id": "uuid",
      "certificationName": "Primeros Auxilios Caninos",
      "issuingInstitution": "Veterinaria XYZ",
      "certificateImage": "/certificates/first-aid.jpg",
      "verificationStatus": "APPROVED",
      "verifiedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## ⭐ APIs de Valoración Avanzada

### GET `/api/products/[id]/reviews`
**Descripción**: Obtener reviews de un producto
**Método**: GET
**Query Params**:
- `page`: Número de página (opcional)
- `limit`: Límite de resultados (opcional)
- `sortBy`: Campo de ordenamiento (opcional)
- `sortOrder`: Orden ascendente/descendente (opcional)

**Respuesta**:
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
  "totalReviews": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### POST `/api/reviews`
**Descripción**: Crear nueva review
**Método**: POST
**Body**:
```json
{
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente producto",
  "images": ["/reviews/review1.jpg"]
}
```
**Respuesta**:
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

### POST `/api/reviews/[id]/helpful`
**Descripción**: Marcar review como útil
**Método**: POST
**Respuesta**:
```json
{
  "success": true,
  "helpfulCount": 13
}
```

### PUT `/api/admin/reviews/[id]/verify`
**Descripción**: Verificar review
**Método**: PUT
**Respuesta**:
```json
{
  "success": true,
  "review": {
    "id": "uuid",
    "isVerified": true,
    "verifiedBy": "admin-id",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🎯 APIs de Recomendaciones

### GET `/api/products/recommended`
**Descripción**: Obtener productos recomendados
**Método**: GET
**Query Params**:
- `type`: Tipo de recomendación (POPULAR, TRENDING, NEW, FEATURED, SIMILAR)
- `limit`: Límite de resultados (opcional)
- `userId`: ID de usuario para recomendaciones personalizadas (opcional)

**Respuesta**:
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
      "seller": {
        "name": "Mascotas Felices",
        "rating": 4.8
      },
      "recommendationType": "FEATURED",
      "priority": 1
    }
  ]
}
```

### GET `/api/services/recommended`
**Descripción**: Obtener servicios recomendados
**Método**: GET
**Query Params**:
- `type`: Tipo de recomendación (POPULAR, TRENDING, NEW, FEATURED, SIMILAR)
- `limit`: Límite de resultados (opcional)
- `userId`: ID de usuario para recomendaciones personalizadas (opcional)

**Respuesta**:
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
        "rating": 4.9,
        "experience": 5
      },
      "recommendationType": "POPULAR",
      "priority": 1
    }
  ]
}
```

### POST `/api/admin/recommended-products`
**Descripción**: Agregar producto a recomendados
**Método**: POST
**Body**:
```json
{
  "productId": "uuid",
  "recommendationType": "FEATURED",
  "priority": 1,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```
**Respuesta**:
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

### POST `/api/admin/recommended-services`
**Descripción**: Agregar servicio a recomendados
**Método**: POST
**Body**:
```json
{
  "serviceId": "uuid",
  "recommendationType": "FEATURED",
  "priority": 1,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```
**Respuesta**:
```json
{
  "success": true,
  "recommendedService": {
    "id": "uuid",
    "serviceId": "uuid",
    "recommendationType": "FEATURED",
    "priority": 1,
    "isActive": true
  }
}
```

---

## ✅ APIs de Verificación de Entrega

### POST `/api/orders/[id]/verify-delivery`
**Descripción**: Verificar entrega de orden
**Método**: POST
**Body**:
```json
{
  "deliveryNotes": "Producto recibido en perfectas condiciones",
  "deliveryImages": ["/deliveries/photo1.jpg"]
}
```
**Respuesta**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "deliveryVerified": true,
    "deliveryVerifiedAt": "2024-01-01T00:00:00.000Z",
    "deliveryVerifiedBy": "customer-id",
    "deliveryNotes": "Producto recibido en perfectas condiciones",
    "deliveryImages": ["/deliveries/photo1.jpg"],
    "sellerPaid": true,
    "sellerPaidAt": "2024-01-01T00:00:00.000Z",
    "sellerPaidAmount": 86.39
  }
}
```

### POST `/api/bookings/[id]/verify-service`
**Descripción**: Verificar servicio completado
**Método**: POST
**Body**:
```json
{
  "serviceNotes": "Excelente servicio, muy profesional",
  "serviceRating": 5
}
```
**Respuesta**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "serviceVerified": true,
    "serviceVerifiedAt": "2024-01-01T00:00:00.000Z",
    "serviceVerifiedBy": "customer-id",
    "serviceNotes": "Excelente servicio, muy profesional",
    "serviceRating": 5,
    "walkerPaid": true,
    "walkerPaidAt": "2024-01-01T00:00:00.000Z",
    "walkerPaidAmount": 49.50
  }
}
```

### GET `/api/orders/[id]/delivery-status`
**Descripción**: Obtener estado de entrega de orden
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "deliveryStatus": {
    "isVerified": true,
    "verifiedAt": "2024-01-01T00:00:00.000Z",
    "verifiedBy": {
      "name": "Juan Cliente",
      "email": "customer@petconnect.com"
    },
    "notes": "Producto recibido en perfectas condiciones",
    "paymentProcessed": true,
    "paidAt": "2024-01-01T00:00:00.000Z",
    "paidAmount": 86.39
  }
}
```

---

## 💰 APIs de Pagos a Vendedores

### GET `/api/sellers/balance`
**Descripción**: Obtener saldo de vendedor
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "balance": {
    "available": 1500.00,
    "pending": 500.00,
    "totalEarned": 2000.00,
    "totalWithdrawn": 500.00,
    "commissionRate": 10.00,
    "currency": "PEN"
  }
}
```

### GET `/api/walkers/balance`
**Descripción**: Obtener saldo de paseador
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "balance": {
    "available": 800.00,
    "pending": 200.00,
    "totalEarned": 1000.00,
    "totalWithdrawn": 200.00,
    "commissionRate": 10.00,
    "currency": "PEN"
  }
}
```

### POST `/api/sellers/withdrawals`
**Descripción**: Solicitar retiro de vendedor
**Método**: POST
**Body**:
```json
{
  "amount": 500.00,
  "method": "bank_transfer",
  "accountInfo": {
    "bank": "BCP",
    "accountNumber": "123456789",
    "accountHolder": "Juan Vendedor",
    "accountType": "savings"
  }
}
```
**Respuesta**:
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

### POST `/api/walkers/withdrawals`
**Descripción**: Solicitar retiro de paseador
**Método**: POST
**Body**:
```json
{
  "amount": 300.00,
  "method": "bank_transfer",
  "accountInfo": {
    "bank": "BBVA",
    "accountNumber": "987654321",
    "accountHolder": "Carlos Paseador",
    "accountType": "checking"
  }
}
```
**Respuesta**:
```json
{
  "success": true,
  "withdrawal": {
    "id": "uuid",
    "amount": 300.00,
    "method": "bank_transfer",
    "accountInfo": {
      "bank": "BBVA",
      "accountNumber": "987654321",
      "accountHolder": "Carlos Paseador"
    },
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/admin/withdrawals`
**Descripción**: Obtener solicitudes de retiro (admin)
**Método**: GET
**Query Params**:
- `status`: Filtrar por estado (PENDING, APPROVED, REJECTED)
- `type`: Tipo de retiro (seller, walker)
- `page`: Número de página (opcional)
- `limit`: Límite de resultados (opcional)

**Respuesta**:
```json
{
  "success": true,
  "withdrawals": [
    {
      "id": "uuid",
      "type": "seller",
      "user": {
        "name": "Juan Vendedor",
        "email": "seller@petconnect.com"
      },
      "amount": 500.00,
      "method": "bank_transfer",
      "accountInfo": {
        "bank": "BCP",
        "accountNumber": "123456789"
      },
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### PUT `/api/admin/withdrawals/[id]/process`
**Descripción**: Procesar retiro (admin)
**Método**: PUT
**Body**:
```json
{
  "status": "APPROVED",
  "processedNotes": "Retiro aprobado y procesado",
  "transactionId": "TXN123456789"
}
```
**Respuesta**:
```json
{
  "success": true,
  "withdrawal": {
    "id": "uuid",
    "status": "APPROVED",
    "processedAt": "2024-01-01T00:00:00.000Z",
    "processedBy": "admin-id",
    "processedNotes": "Retiro aprobado y procesado",
    "transactionId": "TXN123456789"
  }
}
```

---

## 🎪 APIs de Banners y Anuncios

### GET `/api/banners`
**Descripción**: Obtener banners activos
**Método**: GET
**Respuesta**:
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
      "isActive": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z"
    }
  ]
}
```

### POST `/api/admin/banners`
**Descripción**: Crear nuevo banner
**Método**: POST
**Body**:
```json
{
  "title": "Nuevo Banner",
  "description": "Descripción del banner",
  "image": "/images/banners/new-banner.jpg",
  "link": "/nueva-oferta",
  "position": 1,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```
**Respuesta**:
```json
{
  "success": true,
  "banner": {
    "id": "uuid",
    "title": "Nuevo Banner",
    "position": 1,
    "isActive": true
  }
}
```

### GET `/api/ads/category/[categoryId]`
**Descripción**: Obtener anuncios por categoría
**Método**: GET
**Respuesta**:
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

### POST `/api/ads/[id]/click`
**Descripción**: Registrar clic en anuncio
**Método**: POST
**Respuesta**:
```json
{
  "success": true,
  "clickCount": 46,
  "ctr": 3.07
}
```

### POST `/api/ads/[id]/view`
**Descripción**: Registrar vista de anuncio
**Método**: POST
**Respuesta**:
```json
{
  "success": true,
  "viewCount": 1501
}
```

### GET `/api/admin/ads/stats`
**Descripción**: Obtener estadísticas de anuncios (admin)
**Método**: GET
**Query Params**:
- `startDate`: Fecha de inicio (opcional)
- `endDate`: Fecha de fin (opcional)
- `type`: Tipo de anuncio (opcional)

**Respuesta**:
```json
{
  "success": true,
  "stats": {
    "totalAds": 25,
    "totalViews": 150000,
    "totalClicks": 4500,
    "averageCTR": 3.0,
    "topPerformingAds": [
      {
        "id": "uuid",
        "title": "Alimento para Gatos",
        "views": 15000,
        "clicks": 600,
        "ctr": 4.0
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

---

## 📊 APIs de Analytics

### POST `/api/analytics/events`
**Descripción**: Registrar evento de analytics
**Método**: POST
**Body**:
```json
{
  "event": "product_view",
  "page": "/products/123",
  "sessionId": "session-id",
  "metadata": {
    "productId": "123",
    "productName": "Alimento Premium para Perros",
    "productPrice": 95.99,
    "categoryId": "category-id"
  }
}
```
**Respuesta**:
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

### GET `/api/analytics/reports/products`
**Descripción**: Obtener reporte de productos
**Método**: GET
**Query Params**:
- `startDate`: Fecha de inicio (opcional)
- `endDate`: Fecha de fin (opcional)
- `limit`: Límite de resultados (opcional)

**Respuesta**:
```json
{
  "success": true,
  "report": {
    "totalViews": 15000,
    "uniqueViewers": 3200,
    "averageRating": 4.5,
    "topProducts": [
      {
        "id": "uuid",
        "name": "Alimento Premium para Perros",
        "views": 1500,
        "uniqueViewers": 450,
        "sales": 125,
        "revenue": 11998.75
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

### GET `/api/analytics/reports/services`
**Descripción**: Obtener reporte de servicios
**Método**: GET
**Query Params**:
- `startDate`: Fecha de inicio (opcional)
- `endDate`: Fecha de fin (opcional)
- `limit`: Límite de resultados (opcional)

**Respuesta**:
```json
{
  "success": true,
  "report": {
    "totalViews": 8000,
    "uniqueViewers": 1200,
    "averageRating": 4.8,
    "topServices": [
      {
        "id": "uuid",
        "name": "Paseo Básico",
        "views": 800,
        "uniqueViewers": 200,
        "bookings": 75,
        "revenue": 4125.00
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

### GET `/api/analytics/reports/users`
**Descripción**: Obtener reporte de usuarios
**Método**: GET
**Query Params**:
- `startDate`: Fecha de inicio (opcional)
- `endDate`: Fecha de fin (opcional)

**Respuesta**:
```json
{
  "success": true,
  "report": {
    "totalUsers": 1500,
    "newUsers": 150,
    "activeUsers": 800,
    "userDistribution": {
      "customers": 900,
      "sellers": 400,
      "walkers": 200
    },
    "topUsersByActivity": [
      {
        "id": "uuid",
        "name": "Juan Cliente",
        "role": "CUSTOMER",
        "totalPurchases": 25,
        "totalSpent": 2450.00
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

### GET `/api/analytics/reports/revenue`
**Descripción**: Obtener reporte de ingresos
**Método**: GET
**Query Params**:
- `startDate`: Fecha de inicio (opcional)
- `endDate`: Fecha de fin (opcional)
- `groupBy`: Agrupar por (day, week, month) (opcional)

**Respuesta**:
```json
{
  "success": true,
  "report": {
    "totalRevenue": 25000.00,
    "totalCommission": 2500.00,
    "netRevenue": 22500.00,
    "revenueBySource": {
      "products": 15000.00,
      "services": 10000.00
    },
    "revenueTrend": [
      {
        "date": "2024-01-01",
        "revenue": 800.00,
        "commission": 80.00
      }
    ],
    "period": "2024-01-01 to 2024-01-31"
  }
}
```

---

## ⚙️ APIs de Configuración de Página

### GET `/api/page/settings/[page]`
**Descripción**: Obtener configuración de página
**Método**: GET
**Respuesta**:
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
    "recommended_services_count": "8",
    "show_testimonials": "true",
    "show_brands": "true",
    "primary_color": "#f97316",
    "secondary_color": "#fbbf24"
  }
}
```

### PUT `/api/admin/page/settings/[page]`
**Descripción**: Actualizar configuración de página
**Método**: PUT
**Body**:
```json
{
  "hero_title": "Nuevo Título de la Página",
  "hero_subtitle": "Nuevo subtítulo descriptivo",
  "show_featured_products": "false",
  "featured_products_count": "12",
  "primary_color": "#3b82f6"
}
```
**Respuesta**:
```json
{
  "success": true,
  "settings": {
    "hero_title": "Nuevo Título de la Página",
    "hero_subtitle": "Nuevo subtítulo descriptivo",
    "show_featured_products": "false",
    "featured_products_count": "12",
    "primary_color": "#3b82f6"
  }
}
```

### GET `/api/page/settings/global`
**Descripción**: Obtener configuración global
**Método**: GET
**Respuesta**:
```json
{
  "success": true,
  "settings": {
    "site_name": "PetConnect",
    "site_description": "Plataforma para conectar amantes de mascotas",
    "site_logo": "/logo.png",
    "site_favicon": "/favicon.ico",
    "contact_email": "info@petconnect.com",
    "contact_phone": "+51 123 456 789",
    "social_media": {
      "facebook": "https://facebook.com/petconnect",
      "instagram": "https://instagram.com/petconnect",
      "twitter": "https://twitter.com/petconnect"
    },
    "seo": {
      "meta_title": "PetConnect - Plataforma para Amantes de Mascotas",
      "meta_description": "Encuentra paseadores, compra productos y servicios para tus mascotas",
      "meta_keywords": "mascotas, paseadores, productos, cuidados"
    }
  }
}
```

### PUT `/api/admin/page/settings/global`
**Descripción**: Actualizar configuración global
**Método**: PUT
**Body**:
```json
{
  "site_name": "PetConnect Pro",
  "site_description": "La mejor plataforma para amantes de mascotas",
  "contact_email": "nuevo@petconnect.com",
  "social_media": {
    "facebook": "https://facebook.com/petconnectpro",
    "instagram": "https://instagram.com/petconnectpro"
  }
}
```
**Respuesta**:
```json
{
  "success": true,
  "settings": {
    "site_name": "PetConnect Pro",
    "site_description": "La mejor plataforma para amantes de mascotas",
    "contact_email": "nuevo@petconnect.com"
  }
}
```

---

## 🎯 Resumen de APIs

### 📊 **Total de APIs Avanzadas: 45+**

| Categoría | Cantidad de APIs | Propósito |
|-----------|------------------|-----------|
| Sistema de Límites | 3 | Control de productos y usuarios |
| Insignias | 4 | Sistema de reconocimiento |
| Verificación de Documentos | 6 | Seguridad y confianza |
| Valoración Avanzada | 4 | Reviews y calificaciones |
| Recomendaciones | 4 | Personalización |
| Verificación de Entrega | 3 | Confirmación de servicios |
| Pagos a Vendedores | 6 | Monetización |
| Banners y Anuncios | 6 | Marketing |
| Analytics | 5 | Estadísticas y reportes |
| Configuración de Página | 4 | Personalización del sitio |

### 🔒 **Seguridad:**
- **Autenticación requerida**: La mayoría de las APIs requieren autenticación
- **Permisos por rol**: Algunas APIs solo son accesibles por administradores
- **Validación de datos**: Todos los inputs son validados
- **Manejo de errores**: Respuestas de error consistentes

### 📈 **Escalabilidad:**
- **Paginación**: APIs con grandes cantidades de datos soportan paginación
- **Filtros**: Muchas APIs permiten filtrar resultados
- **Ordenamiento**: Soporte para ordenamiento personalizado
- **Metadatos**: Información adicional para clientes

### 🎯 **Integración:**
- **Formato consistente**: Todas las APIs siguen el mismo formato de respuesta
- **Documentación completa**: Cada API tiene documentación detallada
- **Ejemplos de uso**: Ejemplos prácticos para cada endpoint
- **Códigos de estado**: Uso adecuado de códigos HTTP

---

## 🚀 **Próximos Pasos**

1. **Implementar las APIs** en el backend
2. **Crear los componentes** del frontend
3. **Integrar el sistema** de analytics
4. **Configurar el sistema** de pagos
5. **Personalizar el diseño** según la configuración

¡Todas las APIs están diseñadas y listas para ser implementadas! 🎉