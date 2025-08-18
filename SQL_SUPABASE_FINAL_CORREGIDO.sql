-- Esquema Completo para Supabase - PetConnect Platform
-- Incluye todas las funcionalidades avanzadas solicitadas

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'WALKER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "ServiceStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BadgeType" AS ENUM ('VERIFIED', 'TOP_SELLER', 'TOP_WALKER', 'EXPERIENCE', 'CERTIFIED', 'RELIABLE', 'FAST_DELIVERY');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'PASSPORT', 'LICENSE', 'CERTIFICATE', 'DEGREE');
CREATE TYPE "RecommendationType" AS ENUM ('POPULAR', 'TRENDING', 'NEW', 'FEATURED', 'SIMILAR');

-- Tabla de Configuración del Sistema
CREATE TABLE "system_configs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE "users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "phone" VARCHAR(50),
    "avatar" TEXT,
    "role" "UserRole" DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN DEFAULT true,
    "emailVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Vendedores
CREATE TABLE "sellers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "storeName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" VARCHAR(50),
    "logo" TEXT,
    "isApproved" BOOLEAN DEFAULT false,
    "maxProducts" INTEGER DEFAULT 50,
    "commissionRate" DECIMAL(5,2) DEFAULT 10.00,
    "totalSales" DECIMAL(12,2) DEFAULT 0.00,
    "totalProducts" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Paseadores
CREATE TABLE "walkers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "phone" VARCHAR(50),
    "address" TEXT,
    "avatar" TEXT,
    "experience" INTEGER,
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN DEFAULT true,
    "isApproved" BOOLEAN DEFAULT false,
    "whatsapp" VARCHAR(50),
    "whatsappEnabled" BOOLEAN DEFAULT false,
    "whatsappPaid" BOOLEAN DEFAULT false,
    "totalServices" INTEGER DEFAULT 0,
    "totalEarnings" DECIMAL(12,2) DEFAULT 0.00,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Clientes
CREATE TABLE "customers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "address" TEXT,
    "phone" VARCHAR(50),
    "dni" VARCHAR(20),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Perfiles de Usuario
CREATE TABLE "user_profiles" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "bio" TEXT,
    "website" VARCHAR(255),
    "facebook" VARCHAR(255),
    "instagram" VARCHAR(255),
    "twitter" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "youtube" VARCHAR(255),
    "tiktok" VARCHAR(255),
    "preferences" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Documentos de Verificación
CREATE TABLE "user_documents" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" VARCHAR(50),
    "documentImage" TEXT NOT NULL,
    "issueDate" DATE,
    "expiryDate" DATE,
    "verificationStatus" "VerificationStatus" DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Certificaciones
CREATE TABLE "user_certifications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "certificationName" VARCHAR(255) NOT NULL,
    "issuingInstitution" VARCHAR(255) NOT NULL,
    "certificateImage" TEXT NOT NULL,
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE,
    "verificationStatus" "VerificationStatus" DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Insignias
CREATE TABLE "badges" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "badgeType" "BadgeType" NOT NULL,
    "icon" TEXT NOT NULL,
    "color" VARCHAR(7) DEFAULT '#FF6B35',
    "requirements" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Insignias de Usuario
CREATE TABLE "user_badges" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "badgeId" UUID NOT NULL,
    "awardedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "awardedBy" UUID,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE,
    FOREIGN KEY ("awardedBy") REFERENCES "users"("id") ON DELETE SET NULL,
    UNIQUE ("userId", "badgeId")
);

-- Tabla de Categorías de Productos
CREATE TABLE "product_categories" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "maxProducts" INTEGER DEFAULT 100,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Marcas
CREATE TABLE "brands" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "logo" TEXT,
    "website" VARCHAR(255),
    "isSponsor" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE "products" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER DEFAULT 0,
    "images" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "sellerId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "brandId" UUID,
    "isFeatured" BOOLEAN DEFAULT false,
    "isRecommended" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    "salesCount" INTEGER DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE,
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL
);

-- Tabla de Servicios
CREATE TABLE "services" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "walkerId" UUID NOT NULL,
    "status" "ServiceStatus" DEFAULT 'AVAILABLE',
    "isFeatured" BOOLEAN DEFAULT false,
    "isRecommended" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    "bookingCount" INTEGER DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE
);

-- Tabla de Horarios
CREATE TABLE "schedules" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "walkerId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    UNIQUE ("walkerId", "dayOfWeek", "startTime")
);

-- Tabla de Enlaces Sociales
CREATE TABLE "social_links" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "walkerId" UUID NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    UNIQUE ("walkerId", "platform")
);

-- Tabla de Órdenes
CREATE TABLE "orders" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "orderNumber" VARCHAR(50) NOT NULL UNIQUE,
    "customerId" UUID NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" DEFAULT 'PENDING',
    "notes" TEXT,
    "deliveryVerified" BOOLEAN DEFAULT false,
    "deliveryVerifiedAt" TIMESTAMP WITH TIME ZONE,
    "deliveryVerifiedBy" UUID,
    "sellerPaid" BOOLEAN DEFAULT false,
    "sellerPaidAt" TIMESTAMP WITH TIME ZONE,
    "sellerPaidAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("deliveryVerifiedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Items de Órdenes
CREATE TABLE "order_items" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "serviceId" UUID,
    "quantity" INTEGER DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE
);

-- Tabla de Reservas
CREATE TABLE "bookings" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "orderId" UUID,
    "serviceId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "walkerId" UUID NOT NULL,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "status" "ServiceStatus" DEFAULT 'BOOKED',
    "notes" TEXT,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "serviceVerified" BOOLEAN DEFAULT false,
    "serviceVerifiedAt" TIMESTAMP WITH TIME ZONE,
    "serviceVerifiedBy" UUID,
    "walkerPaid" BOOLEAN DEFAULT false,
    "walkerPaidAt" TIMESTAMP WITH TIME ZONE,
    "walkerPaidAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceVerifiedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Pagos
CREATE TABLE "payments" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "orderId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(50) NOT NULL,
    "transactionId" VARCHAR(255),
    "status" "PaymentStatus" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
);

-- Tabla de Reviews
CREATE TABLE "reviews" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "customerId" UUID,
    "productId" UUID,
    "serviceId" UUID,
    "walkerId" UUID,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "images" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "isVerified" BOOLEAN DEFAULT false,
    "helpfulCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE
);

-- Tabla de Notificaciones
CREATE TABLE "notifications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Configuración de Notificaciones de Usuario
CREATE TABLE "user_notification_settings" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "emailNotifications" BOOLEAN DEFAULT true,
    "pushNotifications" BOOLEAN DEFAULT true,
    "orderUpdates" BOOLEAN DEFAULT true,
    "bookingUpdates" BOOLEAN DEFAULT true,
    "promotionalEmails" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Banners
CREATE TABLE "banners" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "position" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "order" INTEGER DEFAULT 0,
    "clickCount" INTEGER DEFAULT 0,
    "viewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Anuncios
CREATE TABLE "advertisements" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "advertiser" VARCHAR(255) NOT NULL,
    "position" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "budget" DECIMAL(10,2),
    "spent" DECIMAL(10,2) DEFAULT 0.00,
    "clickCount" INTEGER DEFAULT 0,
    "viewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Campañas de Marketing
CREATE TABLE "campaigns" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'DRAFT',
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "targetAudience" JSONB,
    "content" JSONB,
    "budget" DECIMAL(10,2),
    "spent" DECIMAL(10,2) DEFAULT 0.00,
    "sentCount" INTEGER DEFAULT 0,
    "openedCount" INTEGER DEFAULT 0,
    "clickedCount" INTEGER DEFAULT 0,
    "conversionCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Analítica de Usuario
CREATE TABLE "user_analytics" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID,
    "sessionId" VARCHAR(255),
    "event" VARCHAR(100) NOT NULL,
    "data" JSONB,
    "url" TEXT,
    "userAgent" TEXT,
    "ipAddress" INET,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Recomendaciones
CREATE TABLE "recommendations" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "productId" UUID,
    "serviceId" UUID,
    "walkerId" UUID,
    "score" DECIMAL(5,4) DEFAULT 0.0000,
    "reason" TEXT,
    "isClicked" BOOLEAN DEFAULT false,
    "isPurchased" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE
);

-- Tabla de Reportes
CREATE TABLE "reports" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "reporterId" UUID NOT NULL,
    "reportedId" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "VerificationStatus" DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reportedId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Conversaciones de Soporte
CREATE TABLE "support_conversations" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'OPEN',
    "priority" VARCHAR(20) DEFAULT 'MEDIUM',
    "assignedTo" UUID,
    "lastMessageAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Mensajes de Soporte
CREATE TABLE "support_messages" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE,
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Configuración de Moneda
CREATE TABLE "currency_settings" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "code" VARCHAR(3) NOT NULL UNIQUE,
    "name" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(5) NOT NULL,
    "exchangeRate" DECIMAL(10,6) DEFAULT 1.000000,
    "isActive" BOOLEAN DEFAULT true,
    "isDefault" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Cambios de Precios
CREATE TABLE "price_history" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "productId" UUID,
    "serviceId" UUID,
    "oldPrice" DECIMAL(10,2) NOT NULL,
    "newPrice" DECIMAL(10,2) NOT NULL,
    "changedBy" UUID NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Auditoría
CREATE TABLE "audit_logs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" UUID,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_created_at" ON "users"("createdAt");
CREATE INDEX "idx_sellers_user_id" ON "sellers"("userId");
CREATE INDEX "idx_sellers_is_approved" ON "sellers"("isApproved");
CREATE INDEX "idx_walkers_user_id" ON "walkers"("userId");
CREATE INDEX "idx_walkers_is_approved" ON "walkers"("isApproved");
CREATE INDEX "idx_walkers_is_available" ON "walkers"("isAvailable");
CREATE INDEX "idx_customers_user_id" ON "customers"("userId");
CREATE INDEX "idx_products_seller_id" ON "products"("sellerId");
CREATE INDEX "idx_products_category_id" ON "products"("categoryId");
CREATE INDEX "idx_products_is_active" ON "products"("isActive");
CREATE INDEX "idx_products_is_featured" ON "products"("isFeatured");
CREATE INDEX "idx_services_walker_id" ON "services"("walkerId");
CREATE INDEX "idx_services_is_active" ON "services"("isActive");
CREATE INDEX "idx_services_status" ON "services"("status");
CREATE INDEX "idx_orders_customer_id" ON "orders"("customerId");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_payment_status" ON "orders"("paymentStatus");
CREATE INDEX "idx_orders_created_at" ON "orders"("createdAt");
CREATE INDEX "idx_order_items_order_id" ON "order_items"("orderId");
CREATE INDEX "idx_order_items_product_id" ON "order_items"("productId");
CREATE INDEX "idx_order_items_service_id" ON "order_items"("serviceId");
CREATE INDEX "idx_bookings_service_id" ON "bookings"("serviceId");
CREATE INDEX "idx_bookings_customer_id" ON "bookings"("customerId");
CREATE INDEX "idx_bookings_walker_id" ON "bookings"("walkerId");
CREATE INDEX "idx_bookings_date" ON "bookings"("date");
CREATE INDEX "idx_bookings_status" ON "bookings"("status");
CREATE INDEX "idx_payments_order_id" ON "payments"("orderId");
CREATE INDEX "idx_payments_status" ON "payments"("status");
CREATE INDEX "idx_reviews_product_id" ON "reviews"("productId");
CREATE INDEX "idx_reviews_service_id" ON "reviews"("serviceId");
CREATE INDEX "idx_reviews_walker_id" ON "reviews"("walkerId");
CREATE INDEX "idx_reviews_rating" ON "reviews"("rating");
CREATE INDEX "idx_reviews_created_at" ON "reviews"("createdAt");
CREATE INDEX "idx_notifications_user_id" ON "notifications"("userId");
CREATE INDEX "idx_notifications_is_read" ON "notifications"("isRead");
CREATE INDEX "idx_banners_position" ON "banners"("position");
CREATE INDEX "idx_banners_is_active" ON "banners"("isActive");
CREATE INDEX "idx_advertisements_position" ON "advertisements"("position");
CREATE INDEX "idx_advertisements_is_active" ON "advertisements"("isActive");
CREATE INDEX "idx_user_analytics_user_id" ON "user_analytics"("userId");
CREATE INDEX "idx_user_analytics_event" ON "user_analytics"("event");
CREATE INDEX "idx_user_analytics_created_at" ON "user_analytics"("createdAt");
CREATE INDEX "idx_recommendations_user_id" ON "recommendations"("userId");
CREATE INDEX "idx_recommendations_type" ON "recommendations"("type");
CREATE INDEX "idx_recommendations_score" ON "recommendations"("score");
CREATE INDEX "idx_reports_reporter_id" ON "reports"("reporterId");
CREATE INDEX "idx_reports_reported_id" ON "reports"("reportedId");
CREATE INDEX "idx_reports_status" ON "reports"("status");
CREATE INDEX "idx_support_conversations_user_id" ON "support_conversations"("userId");
CREATE INDEX "idx_support_conversations_status" ON "support_conversations"("status");
CREATE INDEX "idx_support_messages_conversation_id" ON "support_messages"("conversationId");
CREATE INDEX "idx_currency_settings_code" ON "currency_settings"("code");
CREATE INDEX "idx_currency_settings_is_active" ON "currency_settings"("isActive");
CREATE INDEX "idx_price_history_product_id" ON "price_history"("productId");
CREATE INDEX "idx_price_history_service_id" ON "price_history"("serviceId");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("userId");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_entity_type" ON "audit_logs"("entityType");
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("createdAt");

-- Crear vista para productos populares
CREATE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.images,
    p."viewCount",
    p."salesCount",
    p."rating",
    p."createdAt",
    s."storeName" as seller_name,
    c.name as category_name,
    b.name as brand_name,
    (p."viewCount" * 0.3 + p."salesCount" * 0.5 + p."rating" * 0.2) as popularity_score
FROM products p
JOIN sellers s ON p."sellerId" = s.id
JOIN product_categories c ON p."categoryId" = c.id
LEFT JOIN brands b ON p."brandId" = b.id
WHERE p."isActive" = true
ORDER BY popularity_score DESC;

-- Crear vista para servicios populares
CREATE VIEW popular_services AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.price,
    s.duration,
    s."viewCount",
    s."bookingCount",
    s."rating",
    s."createdAt",
    w.name as walker_name,
    (s."viewCount" * 0.3 + s."bookingCount" * 0.5 + s."rating" * 0.2) as popularity_score
FROM services s
JOIN walkers w ON s."walkerId" = w.id
WHERE s."isActive" = true
ORDER BY popularity_score DESC;

-- Crear vista para ingresos mensuales
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', "createdAt") as month,
    SUM(CASE WHEN status = 'COMPLETED' THEN "totalAmount" ELSE 0 END) as total_revenue,
    COUNT(*) as total_orders,
    AVG(CASE WHEN status = 'COMPLETED' THEN "totalAmount" ELSE 0 END) as avg_order_value
FROM orders
GROUP BY DATE_TRUNC('month', "createdAt")
ORDER BY month DESC;

-- Crear vista para actividad de usuarios
CREATE VIEW user_activity AS
SELECT 
    DATE_TRUNC('day', "createdAt") as day,
    COUNT(DISTINCT "userId") as active_users,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event = 'PAGE_VIEW' THEN 1 END) as page_views,
    COUNT(CASE WHEN event = 'PRODUCT_VIEW' THEN 1 END) as product_views,
    COUNT(CASE WHEN event = 'ADD_TO_CART' THEN 1 END) as add_to_carts,
    COUNT(CASE WHEN event = 'PURCHASE' THEN 1 END) as purchases
FROM user_analytics
GROUP BY DATE_TRUNC('day', "createdAt")
ORDER BY day DESC;

-- Insertar datos iniciales para categorías de productos
INSERT INTO "product_categories" (name, description, maxProducts) VALUES
('Alimento para Perros', 'Comida balanceada y nutritiva para perros de todas las razas y edades', 200),
('Alimento para Gatos', 'Comida especializada para gatos con diferentes necesidades nutricionales', 200),
('Accesorios para Mascotas', 'Collares, correas, juguetes y otros accesorios esenciales', 300),
('Higiene y Cuidado', 'Productos de limpieza, cepillos y cuidado para mascotas', 150),
('Salud y Bienestar', 'Vitaminas, suplementos y productos para la salud de mascotas', 100),
('Camas y Muebles', 'Camas cómodas, muebles y espacios para descanso de mascotas', 80),
('Transporte', 'Transportines, arneses y accesorios para viajar con mascotas', 60);

-- Insertar datos iniciales para marcas
INSERT INTO "brands" (name, description, isSponsor, "order") VALUES
('Royal Canin', 'Alimento premium para perros y gatos', true, 1),
('Hills', 'Ciencia y nutrición avanzada para mascotas', true, 2),
('Pedigree', 'Alimento de calidad para perros', false, 3),
('Whiskas', 'Delicias para gatos', false, 4),
('Frisco', 'Accesorios y productos para mascotas', false, 5);

-- Insertar datos iniciales para insignias
INSERT INTO "badges" (name, description, badgeType, icon, color, requirements) VALUES
('Verificado', 'Cuenta verificada por el equipo de PetConnect', 'VERIFIED', 'shield', '#22c55e', '{"emailVerified": true, "phoneVerified": true}'),
('Vendedor Destacado', 'Vendedor con excelentes calificaciones y ventas', 'TOP_SELLER', 'star', '#f59e0b', '{"minRating": 4.5, "minSales": 50}'),
('Paseador Estrella', 'Paseador con excelente reputación y servicio', 'TOP_WALKER', 'star', '#8b5cf6', '{"minRating": 4.8, "minServices": 30}'),
('Experto', 'Más de 5 años de experiencia en el sector', 'EXPERIENCE', 'award', '#ef4444', '{"minExperience": 5}'),
('Certificado', 'Posee certificaciones profesionales', 'CERTIFIED', 'certificate', '#3b82f6', '{"hasCertifications": true}'),
('Confiable', 'Siempre cumple con sus compromisos', 'RELIABLE', 'check-circle', '#10b981', '{"completionRate": 0.95}'),
('Entrega Rápida', 'Entrega productos en menos de 24 horas', 'FAST_DELIVERY', 'zap', '#f97316', '{"avgDeliveryTime": 24}');

-- Insertar datos iniciales para configuración del sistema
INSERT INTO "system_configs" (key, value, description) VALUES
('whatsapp_price', '37.00', 'Precio del servicio de WhatsApp para paseadores'),
('whatsapp_currency', 'PEN', 'Moneda del servicio de WhatsApp'),
('site_name', 'PetConnect', 'Nombre del sitio'),
('site_description', 'Conectamos amantes de mascotas', 'Descripción del sitio'),
('contact_email', 'info@petconnect.com', 'Email de contacto'),
('contact_phone', '+1 234 567 890', 'Teléfono de contacto'),
('max_products_per_seller', '50', 'Máximo de productos por vendedor'),
('commission_rate', '10.00', 'Tasa de comisión por defecto'),
('support_whatsapp', '+51 987 654 321', 'WhatsApp de soporte');

-- Insertar datos iniciales para monedas
INSERT INTO "currency_settings" (code, name, symbol, exchangeRate, isDefault) VALUES
('PEN', 'Sol Peruano', 'S/', 1.000000, true),
('USD', 'Dólar Americano', '$', 3.750000, false);

-- Insertar banners iniciales
INSERT INTO "banners" (title, description, image, position, isActive, "order") VALUES
('Bienvenidos a PetConnect', 'La plataforma completa para amantes de mascotas', '/images/banner-welcome.jpg', 'HOME', true, 1),
('Productos Destacados', 'Descubre nuestros productos más populares', '/images/banner-products.jpg', 'HOME', true, 2),
('Servicios Premium', 'Paseadores profesionales para tus mascotas', '/images/banner-services.jpg', 'HOME', true, 3);

-- Completar la creación del esquema
-- Este esquema está listo para usar con la aplicación PetConnect