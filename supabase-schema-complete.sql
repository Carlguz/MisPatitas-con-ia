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
    "maxProducts" INTEGER DEFAULT 50, -- Límite de productos
    "commissionRate" DECIMAL(5,2) DEFAULT 10.00, -- Comisión por venta
    "totalSales" DECIMAL(12,2) DEFAULT 0.00, -- Total de ventas
    "totalProducts" INTEGER DEFAULT 0, -- Total de productos creados
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
    "experience" INTEGER, -- años de experiencia
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN DEFAULT true,
    "isApproved" BOOLEAN DEFAULT false,
    "whatsapp" VARCHAR(50), -- número de WhatsApp
    "whatsappEnabled" BOOLEAN DEFAULT false, -- si el WhatsApp está habilitado para clientes
    "whatsappPaid" BOOLEAN DEFAULT false, -- si el paseador ha pagado por el servicio de WhatsApp
    "totalServices" INTEGER DEFAULT 0, -- Total de servicios realizados
    "totalEarnings" DECIMAL(12,2) DEFAULT 0.00, -- Total ganado
    "rating" DECIMAL(3,2) DEFAULT 0.00, -- Calificación promedio
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
    "dni" VARCHAR(20), -- Documento de identidad
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Perfiles de Usuario (Datos adicionales)
CREATE TABLE "user_profiles" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE,
    "bio" TEXT, -- Biografía del usuario
    "website" VARCHAR(255), -- Sitio web personal
    "facebook" VARCHAR(255),
    "instagram" VARCHAR(255),
    "twitter" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "youtube" VARCHAR(255),
    "tiktok" VARCHAR(255),
    "preferences" JSONB, -- Preferencias del usuario
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Documentos de Verificación
CREATE TABLE "user_documents" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" VARCHAR(50), -- Número de documento
    "documentImage" TEXT NOT NULL, -- URL de la imagen del documento
    "issueDate" DATE, -- Fecha de emisión
    "expiryDate" DATE, -- Fecha de vencimiento
    "verificationStatus" "VerificationStatus" DEFAULT 'PENDING',
    "verificationNotes" TEXT, -- Notas de verificación
    "verifiedBy" UUID, -- ID del administrador que verificó
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
    "certificateImage" TEXT NOT NULL, -- URL de la imagen del certificado
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

-- Tabla de Insignias (Badges)
CREATE TABLE "badges" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "badgeType" "BadgeType" NOT NULL,
    "icon" TEXT NOT NULL, -- URL del icono de la insignia
    "color" VARCHAR(7) DEFAULT '#FF6B35', -- Color hexadecimal
    "requirements" JSONB, -- Requisitos para obtener la insignia
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
    "awardedBy" UUID, -- ID del administrador que otorgó la insignia
    "expiresAt" TIMESTAMP WITH TIME ZONE, -- Fecha de expiración (si aplica)
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("badgeId" REFERENCES "badges"("id") ON DELETE CASCADE,
    FOREIGN KEY ("awardedBy" REFERENCES "users"("id") ON DELETE SET NULL,
    UNIQUE ("userId", "badgeId")
);

-- Tabla de Categorías de Productos
CREATE TABLE "product_categories" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "maxProducts" INTEGER DEFAULT 100, -- Límite de productos por categoría
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
    "images" TEXT, -- JSON array de URLs de imágenes
    "isActive" BOOLEAN DEFAULT true,
    "sellerId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "brandId" UUID,
    "isFeatured" BOOLEAN DEFAULT false, -- Producto destacado
    "isRecommended" BOOLEAN DEFAULT false, -- Producto recomendado
    "viewCount" INTEGER DEFAULT 0, -- Contador de vistas
    "salesCount" INTEGER DEFAULT 0, -- Contador de ventas
    "rating" DECIMAL(3,2) DEFAULT 0.00, -- Calificación promedio
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
    "duration" INTEGER NOT NULL, -- duración en minutos
    "isActive" BOOLEAN DEFAULT true,
    "walkerId" UUID NOT NULL,
    "status" "ServiceStatus" DEFAULT 'AVAILABLE',
    "isFeatured" BOOLEAN DEFAULT false, -- Servicio destacado
    "isRecommended" BOOLEAN DEFAULT false, -- Servicio recomendado
    "viewCount" INTEGER DEFAULT 0, -- Contador de vistas
    "bookingCount" INTEGER DEFAULT 0, -- Contador de reservas
    "rating" DECIMAL(3,2) DEFAULT 0.00, -- Calificación promedio
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE
);

-- Tabla de Horarios
CREATE TABLE "schedules" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "walkerId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL, -- 0-6 (Domingo-Sábado)
    "startTime" VARCHAR(5) NOT NULL, -- formato HH:mm
    "endTime" VARCHAR(5) NOT NULL, -- formato HH:mm
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
    "platform" VARCHAR(50) NOT NULL, -- instagram, facebook, twitter, etc.
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
    "deliveryVerified" BOOLEAN DEFAULT false, -- Verificación de entrega
    "deliveryVerifiedAt" TIMESTAMP WITH TIME ZONE, -- Fecha de verificación de entrega
    "deliveryVerifiedBy" UUID, -- ID del cliente que verificó la entrega
    "sellerPaid" BOOLEAN DEFAULT false, -- Si se ha pagado al vendedor
    "sellerPaidAt" TIMESTAMP WITH TIME ZONE, -- Fecha de pago al vendedor
    "sellerPaidAmount" DECIMAL(10,2), -- Monto pagado al vendedor
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("deliveryVerifiedBy" REFERENCES "users"("id") ON DELETE SET NULL
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
    "startTime" VARCHAR(5) NOT NULL, -- formato HH:mm
    "endTime" VARCHAR(5) NOT NULL, -- formato HH:mm
    "status" "ServiceStatus" DEFAULT 'BOOKED',
    "notes" TEXT,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "serviceVerified" BOOLEAN DEFAULT false, -- Verificación del servicio
    "serviceVerifiedAt" TIMESTAMP WITH TIME ZONE, -- Fecha de verificación del servicio
    "serviceVerifiedBy" UUID, -- ID del cliente que verificó el servicio
    "walkerPaid" BOOLEAN DEFAULT false, -- Si se ha pagado al paseador
    "walkerPaidAt" TIMESTAMP WITH TIME ZONE, -- Fecha de pago al paseador
    "walkerPaidAmount" DECIMAL(10,2), -- Monto pagado al paseador
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("customerId" REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceVerifiedBy" REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Pagos
CREATE TABLE "payments" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "orderId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(50) NOT NULL, -- stripe, paypal, etc.
    "transactionId" VARCHAR(255),
    "status" "PaymentStatus" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
);

-- Tabla de Reviews (Valoración avanzada)
CREATE TABLE "reviews" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "customerId" UUID,
    "productId" UUID,
    "serviceId" UUID,
    "walkerId" UUID,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" TEXT,
    "images" TEXT, -- JSON array de URLs de imágenes
    "isActive" BOOLEAN DEFAULT true,
    "isVerified" BOOLEAN DEFAULT false, -- Review verificada
    "helpfulCount" INTEGER DEFAULT 0, -- Contador de "útil"
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
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- info, success, warning, error
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Banners Publicitarios
CREATE TABLE "banners" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "position" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Anuncios
CREATE TABLE "ads" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- 'banner', 'sidebar', 'category'
    "categoryId" UUID,
    "brandId" UUID,
    "position" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "clickCount" INTEGER DEFAULT 0, -- Contador de clics
    "viewCount" INTEGER DEFAULT 0, -- Contador de vistas
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE,
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE
);

-- Tabla de Productos Recomendados
CREATE TABLE "recommended_products" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "productId" UUID NOT NULL,
    "recommendationType" "RecommendationType" NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

-- Tabla de Servicios Recomendados
CREATE TABLE "recommended_services" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "serviceId" UUID NOT NULL,
    "recommendationType" "RecommendationType" NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE
);

-- Tabla de Configuración de Página
CREATE TABLE "page_settings" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "page" VARCHAR(100) NOT NULL, -- 'home', 'products', 'services', etc.
    "settingKey" VARCHAR(255) NOT NULL,
    "settingValue" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE ("page", "settingKey")
);

-- Tabla de Eventos de Analytics
CREATE TABLE "analytics_events" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "event" VARCHAR(100) NOT NULL,
    "page" VARCHAR(100),
    "userId" UUID,
    "sessionId" VARCHAR(255),
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Retiros de Vendedores
CREATE TABLE "seller_withdrawals" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "sellerId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(50) NOT NULL, -- 'bank_transfer', 'paypal', 'stripe'
    "accountInfo" JSONB, -- Información de la cuenta bancaria
    "status" "PaymentStatus" DEFAULT 'PENDING',
    "processedAt" TIMESTAMP WITH TIME ZONE,
    "processedBy" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("processedBy" REFERENCES "users"("id") ON DELETE SET NULL
);

-- Tabla de Retiros de Paseadores
CREATE TABLE "walker_withdrawals" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "walkerId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(50) NOT NULL, -- 'bank_transfer', 'paypal', 'stripe'
    "accountInfo" JSONB, -- Información de la cuenta bancaria
    "status" "PaymentStatus" DEFAULT 'PENDING',
    "processedAt" TIMESTAMP WITH TIME ZONE,
    "processedBy" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("processedBy" REFERENCES "users"("id") ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_brandId_idx" ON "products"("brandId");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");
CREATE INDEX "products_isRecommended_idx" ON "products"("isRecommended");
CREATE INDEX "services_walkerId_idx" ON "services"("walkerId");
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "services_isFeatured_idx" ON "services"("isFeatured");
CREATE INDEX "services_isRecommended_idx" ON "services"("isRecommended");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "orders_deliveryVerified_idx" ON "orders"("deliveryVerified");
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");
CREATE INDEX "bookings_walkerId_idx" ON "bookings"("walkerId");
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_serviceVerified_idx" ON "bookings"("serviceVerified");
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_serviceId_idx" ON "reviews"("serviceId");
CREATE INDEX "reviews_walkerId_idx" ON "reviews"("walkerId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "walkers_whatsappEnabled_idx" ON "walkers"("whatsappEnabled");
CREATE INDEX "walkers_whatsappPaid_idx" ON "walkers"("whatsappPaid");
CREATE INDEX "user_documents_userId_idx" ON "user_documents"("userId");
CREATE INDEX "user_documents_verificationStatus_idx" ON "user_documents"("verificationStatus");
CREATE INDEX "user_certifications_userId_idx" ON "user_certifications"("userId");
CREATE INDEX "user_certifications_verificationStatus_idx" ON "user_certifications"("verificationStatus");
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");
CREATE INDEX "banners_position_idx" ON "banners"("position");
CREATE INDEX "ads_type_idx" ON "ads"("type");
CREATE INDEX "ads_categoryId_idx" ON "ads"("categoryId");
CREATE INDEX "ads_brandId_idx" ON "ads"("brandId");
CREATE INDEX "recommended_products_productId_idx" ON "recommended_products"("productId");
CREATE INDEX "recommended_services_serviceId_idx" ON "recommended_services"("serviceId");
CREATE INDEX "page_settings_page_idx" ON "page_settings"("page");
CREATE INDEX "analytics_events_event_idx" ON "analytics_events"("event");
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");
CREATE INDEX "seller_withdrawals_sellerId_idx" ON "seller_withdrawals"("sellerId");
CREATE INDEX "walker_withdrawals_walkerId_idx" ON "walker_withdrawals"("walkerId");

-- Crear función para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updatedAt en todas las tablas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON "sellers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_walkers_updated_at BEFORE UPDATE ON "walkers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON "customers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON "user_profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_documents_updated_at BEFORE UPDATE ON "user_documents" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON "user_certifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON "badges" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_badges_updated_at BEFORE UPDATE ON "user_badges" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON "product_categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON "brands" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON "schedules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON "social_links" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON "order_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON "bookings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "reviews" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON "banners" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON "ads" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommended_products_updated_at BEFORE UPDATE ON "recommended_products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommended_services_updated_at BEFORE UPDATE ON "recommended_services" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_settings_updated_at BEFORE UPDATE ON "page_settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON "system_configs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_events_updated_at BEFORE UPDATE ON "analytics_events" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_withdrawals_updated_at BEFORE UPDATE ON "seller_withdrawals" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_walker_withdrawals_updated_at BEFORE UPDATE ON "walker_withdrawals" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo iniciales
-- Configuración del sistema
INSERT INTO "system_configs" ("id", "key", "value", "description") VALUES
(uuid_generate_v4(), 'whatsapp_price', '37.00', 'Precio del servicio de WhatsApp en Soles Peruanos'),
(uuid_generate_v4(), 'currency_exchange_rate', '0.27', 'Tasa de cambio PEN a USD'),
(uuid_generate_v4(), 'site_name', 'PetConnect', 'Nombre del sitio'),
(uuid_generate_v4(), 'site_description', 'Plataforma para conectar amantes de mascotas', 'Descripción del sitio'),
(uuid_generate_v4(), 'max_products_per_seller', '50', 'Máximo de productos por vendedor'),
(uuid_generate_v4(), 'max_products_per_category', '100', 'Máximo de productos por categoría'),
(uuid_generate_v4(), 'commission_rate', '10.00', 'Tasa de comisión por defecto'),
(uuid_generate_v4(), 'home_featured_products', '8', 'Número de productos destacados en la página principal'),
(uuid_generate_v4(), 'home_recommended_products', '12', 'Número de productos recomendados en la página principal'),
(uuid_generate_v4(), 'home_featured_services', '6', 'Número de servicios destacados en la página principal'),
(uuid_generate_v4(), 'home_recommended_services', '8', 'Número de servicios recomendados en la página principal');

-- Categorías de productos
INSERT INTO "product_categories" ("id", "name", "description", "image", "maxProducts") VALUES
(uuid_generate_v4(), 'Alimentos para Mascotas', 'Comida balanceada y nutritiva para tus mascotas', '/images/categories/food.jpg', 100),
(uuid_generate_v4(), 'Accesorios', 'Collares, correas, juguetes y más', '/images/categories/accessories.jpg', 100),
(uuid_generate_v4(), 'Salud y Cuidado', 'Productos de higiene y salud para mascotas', '/images/categories/health.jpg', 100),
(uuid_generate_v4(), 'Camas y Casas', 'Espacios cómodos para descansar', '/images/categories/beds.jpg', 100);

-- Marcas
INSERT INTO "brands" ("id", "name", "description", "isSponsor") VALUES
(uuid_generate_v4(), 'PetFood Pro', 'Alimentos premium para mascotas', true),
(uuid_generate_v4(), 'Happy Pet', 'Accesorios y juguetes', false),
(uuid_generate_v4(), 'VetCare', 'Productos de salud veterinaria', true),
(uuid_generate_v4(), 'Comfort Pet', 'Camas y casas para mascotas', false);

-- Insignias
INSERT INTO "badges" ("id", "name", "description", "badgeType", "icon", "color", "requirements") VALUES
(uuid_generate_v4(), 'Vendedor Verificado', 'Vendedor con documentos verificados', 'VERIFIED', '/badges/verified.svg', '#4CAF50', '{"documentVerification": true}'),
(uuid_generate_v4(), 'Paseador Verificado', 'Paseador con documentos y certificados verificados', 'VERIFIED', '/badges/verified.svg', '#4CAF50', '{"documentVerification": true, "certificationVerification": true}'),
(uuid_generate_v4(), 'Top Vendedor', 'Vendedor con más de 100 ventas', 'TOP_SELLER', '/badges/top-seller.svg', '#FF9800', '{"minSales": 100}'),
(uuid_generate_v4(), 'Top Paseador', 'Paseador con más de 50 servicios completados', 'TOP_WALKER', '/badges/top-walker.svg', '#FF9800', '{"minServices": 50}'),
(uuid_generate_v4(), 'Experto en Mascotas', 'Más de 5 años de experiencia', 'EXPERIENCE', '/badges/experience.svg', '#9C27B0', '{"minExperience": 5}'),
(uuid_generate_v4(), 'Certificado Profesional', 'Posee certificaciones profesionales', 'CERTIFIED', '/badges/certified.svg', '#2196F3', '{"hasCertifications": true}'),
(uuid_generate_v4(), 'Servicio Confiable', 'Calificación promedio mayor a 4.5', 'RELIABLE', '/badges/reliable.svg', '#4CAF50', '{"minRating": 4.5}'),
(uuid_generate_v4(), 'Entrega Rápida', 'Tiempo de entrega promedio menor a 24 horas', 'FAST_DELIVERY', '/badges/fast-delivery.svg', '#FF5722', '{"maxDeliveryTime": 24}');

-- Usuarios iniciales
-- Admin
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified") VALUES
(uuid_generate_v4(), 'admin@petconnect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Administrador', 'ADMIN', true);

-- Vendedor
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified") VALUES
(uuid_generate_v4(), 'seller@petconnect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Tienda Mascotas Felices', 'SELLER', true);

-- Paseador
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified") VALUES
(uuid_generate_v4(), 'walker@petconnect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Carlos Paseador', 'WALKER', true);

-- Cliente
INSERT INTO "users" ("id", "email", "password", "name", "role", "emailVerified") VALUES
(uuid_generate_v4(), 'customer@petconnect.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Juan Cliente', 'CUSTOMER', true);

-- Perfiles de usuarios
-- Vendedor
INSERT INTO "sellers" ("id", "userId", "storeName", "description", "maxProducts", "commissionRate", "isApproved") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'seller@petconnect.com'), 'Mascotas Felices', 'La mejor tienda para tus mascotas', 50, 10.00, true);

-- Paseador (con datos de WhatsApp de ejemplo)
INSERT INTO "walkers" ("id", "userId", "name", "description", "experience", "pricePerHour", "whatsapp", "whatsappEnabled", "whatsappPaid", "isApproved") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'walker@petconnect.com'), 'Carlos Rodríguez', 'Paseador profesional con 5 años de experiencia', 5, 55.00, '+51987654321', true, true, true);

-- Cliente
INSERT INTO "customers" ("id", "userId", "dni") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'customer@petconnect.com'), '12345678');

-- Perfiles extendidos
INSERT INTO "user_profiles" ("id", "userId", "bio", "website") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'seller@petconnect.com'), 'Somos una tienda especializada en productos para mascotas con más de 10 años de experiencia.', 'https://mascotasfelices.com'),
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'walker@petconnect.com'), 'Paseador profesional apasionado por el cuidado de mascotas. Certificado en primeros auxilios caninos.', 'https://carlospaseador.com'),
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'customer@petconnect.com'), 'Amante de las mascotas con 2 perros y 1 gato.', NULL);

-- Productos de ejemplo (precios en Soles Peruanos)
INSERT INTO "products" ("id", "name", "description", "price", "stock", "sellerId", "categoryId", "brandId", "isFeatured", "isRecommended") VALUES
(uuid_generate_v4(), 'Alimento Premium para Perros', 'Comida balanceada para perros adultos', 95.99, 50, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Alimentos para Mascotas'), (SELECT id FROM "brands" WHERE name = 'PetFood Pro'), true, true),
(uuid_generate_v4(), 'Juguete Interactivo para Gatos', 'Juguete con pluma y campana', 48.99, 30, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Accesorios'), (SELECT id FROM "brands" WHERE name = 'Happy Pet'), false, true),
(uuid_generate_v4(), 'Cepillo para Mascotas', 'Cepillo de cerdas suaves para el cuidado del pelaje', 68.50, 25, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Salud y Cuidado'), (SELECT id FROM "brands" WHERE name = 'VetCare'), true, false);

-- Servicios de ejemplo (precios en Soles Peruanos)
INSERT INTO "services" ("id", "name", "description", "price", "duration", "walkerId", "isFeatured", "isRecommended") VALUES
(uuid_generate_v4(), 'Paseo Básico', 'Paseo de 30 minutos por el parque', 55.00, 30, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), true, true),
(uuid_generate_v4(), 'Paseo Extendido', 'Paseo de 60 minutos con tiempo de juego', 92.50, 60, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), false, true),
(uuid_generate_v4(), 'Paseo Premium', 'Paseo de 90 minutos con entrenamiento básico', 148.00, 90, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), true, false);

-- Configuración de página principal
INSERT INTO "page_settings" ("id", "page", "settingKey", "settingValue", "description") VALUES
(uuid_generate_v4(), 'home', 'hero_title', 'Conectamos Amantes de Mascotas', 'Título principal del hero'),
(uuid_generate_v4(), 'home', 'hero_subtitle', 'La plataforma completa para paseadores de mascotas, vendedores de productos y clientes. Todo en un solo lugar.', 'Subtítulo del hero'),
(uuid_generate_v4(), 'home', 'hero_image', '/images/hero-bg.jpg', 'Imagen de fondo del hero'),
(uuid_generate_v4(), 'home', 'show_featured_products', 'true', 'Mostrar productos destacados'),
(uuid_generate_v4(), 'home', 'show_recommended_products', 'true', 'Mostrar productos recomendados'),
(uuid_generate_v4(), 'home', 'show_featured_services', 'true', 'Mostrar servicios destacados'),
(uuid_generate_v4(), 'home', 'show_recommended_services', 'true', 'Mostrar servicios recomendados'),
(uuid_generate_v4(), 'home', 'featured_products_count', '8', 'Número de productos destacados'),
(uuid_generate_v4(), 'home', 'recommended_products_count', '12', 'Número de productos recomendados'),
(uuid_generate_v4(), 'home', 'featured_services_count', '6', 'Número de servicios destacados'),
(uuid_generate_v4(), 'home', 'recommended_services_count', '8', 'Número de servicios recomendados');

-- Banners de ejemplo
INSERT INTO "banners" ("id", "title", "description", "image", "link", "position") VALUES
(uuid_generate_v4(), 'Oferta Especial', '20% de descuento en alimentos premium', '/images/banners/sale-banner.jpg', '/ofertas', 1),
(uuid_generate_v4(), 'Nuevo Servicio', 'Paseo premium con entrenamiento incluido', '/images/banners/service-banner.jpg', '/servicios', 2),
(uuid_generate_v4(), 'Productos Destacados', 'Los mejores productos para tu mascota', '/images/banners/products-banner.jpg', '/productos', 3);

-- Anuncios de ejemplo
INSERT INTO "ads" ("id", "title", "description", "image", "link", "type", "categoryId", "position") VALUES
(uuid_generate_v4(), 'Alimento para Gatos', 'Comida premium para gatos de todas las edades', '/images/ads/cat-food.jpg', '/productos/gatos', 'category', (SELECT id FROM "product_categories" WHERE name = 'Alimentos para Mascotas'), 1),
(uuid_generate_v4(), 'Juguetes para Perros', 'Juguetes interactivos para mantener a tu perro activo', '/images/ads/dog-toys.jpg', '/productos/perros', 'category', (SELECT id FROM "product_categories" WHERE name = 'Accesorios'), 2);

-- Productos recomendados
INSERT INTO "recommended_products" ("id", "productId", "recommendationType", "priority") VALUES
(uuid_generate_v4(), (SELECT id FROM "products" WHERE name = 'Alimento Premium para Perros'), 'FEATURED', 1),
(uuid_generate_v4(), (SELECT id FROM "products" WHERE name = 'Juguete Interactivo para Gatos'), 'POPULAR', 2),
(uuid_generate_v4(), (SELECT id FROM "products" WHERE name = 'Cepillo para Mascotas'), 'NEW', 3);

-- Servicios recomendados
INSERT INTO "recommended_services" ("id", "serviceId", "recommendationType", "priority") VALUES
(uuid_generate_v4(), (SELECT id FROM "services" WHERE name = 'Paseo Básico'), 'FEATURED', 1),
(uuid_generate_v4(), (SELECT id FROM "services" WHERE name = 'Paseo Extendido'), 'POPULAR', 2),
(uuid_generate_v4(), (SELECT id FROM "services" WHERE name = 'Paseo Premium'), 'FEATURED', 3);