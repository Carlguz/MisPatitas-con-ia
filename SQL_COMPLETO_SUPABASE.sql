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
    "type" VARCHAR(50) NOT NULL, -- ORDER, BOOKING, PAYMENT, REVIEW, SYSTEM, etc.
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB, -- Datos adicionales
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Banners de Marketing
CREATE TABLE "banners" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL, -- URL de la imagen del banner
    "link" TEXT, -- URL de destino
    "position" VARCHAR(50) DEFAULT 'HOME', -- HOME, SIDEBAR, FOOTER, etc.
    "order" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "clickCount" INTEGER DEFAULT 0, -- Contador de clicks
    "viewCount" INTEGER DEFAULT 0, -- Contador de vistas
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Anuncios de Marcas
CREATE TABLE "brand_ads" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "brandId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL, -- URL de la imagen del anuncio
    "link" TEXT, -- URL de destino
    "position" VARCHAR(50) DEFAULT 'SIDEBAR', -- HOME, SIDEBAR, FOOTER, etc.
    "order" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "clickCount" INTEGER DEFAULT 0, -- Contador de clicks
    "viewCount" INTEGER DEFAULT 0, -- Contador de vistas
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE
);

-- Tabla de Recomendaciones
CREATE TABLE "recommendations" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "type" "RecommendationType" NOT NULL,
    "productId" UUID,
    "serviceId" UUID,
    "walkerId" UUID,
    "sellerId" UUID,
    "score" DECIMAL(5,2) DEFAULT 0.00, -- Puntuación de recomendación
    "reason" TEXT, -- Razón de la recomendación
    "isShown" BOOLEAN DEFAULT false, -- Si se ha mostrado al usuario
    "isClicked" BOOLEAN DEFAULT false, -- Si el usuario hizo clic
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE
);

-- Tabla de Analítica de Usuarios
CREATE TABLE "user_analytics" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "event" VARCHAR(50) NOT NULL, -- PAGE_VIEW, PRODUCT_VIEW, ADD_TO_CART, PURCHASE, etc.
    "data" JSONB, -- Datos adicionales del evento
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Reportes de Sistema
CREATE TABLE "system_reports" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "reportType" VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    "title" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL, -- Datos del reporte
    "generatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración de Monedas
CREATE TABLE "currency_configs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "code" VARCHAR(3) NOT NULL UNIQUE, -- PEN, USD, etc.
    "name" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(5) NOT NULL, -- S/, $, etc.
    "exchangeRate" DECIMAL(10,6) DEFAULT 1.000000, -- Tasa de cambio respecto a la moneda base
    "isActive" BOOLEAN DEFAULT true,
    "isDefault" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_isActive" ON "users"("isActive");

CREATE INDEX "idx_sellers_userId" ON "sellers"("userId");
CREATE INDEX "idx_sellers_isApproved" ON "sellers"("isApproved");

CREATE INDEX "idx_walkers_userId" ON "walkers"("userId");
CREATE INDEX "idx_walkers_isApproved" ON "walkers"("isApproved");
CREATE INDEX "idx_walkers_isAvailable" ON "walkers"("isAvailable");

CREATE INDEX "idx_customers_userId" ON "customers"("userId");

CREATE INDEX "idx_products_sellerId" ON "products"("sellerId");
CREATE INDEX "idx_products_categoryId" ON "products"("categoryId");
CREATE INDEX "idx_products_isActive" ON "products"("isActive");
CREATE INDEX "idx_products_isFeatured" ON "products"("isFeatured");

CREATE INDEX "idx_services_walkerId" ON "services"("walkerId");
CREATE INDEX "idx_services_status" ON "services"("status");
CREATE INDEX "idx_services_isActive" ON "services"("isActive");

CREATE INDEX "idx_orders_customerId" ON "orders"("customerId");
CREATE INDEX "idx_orders_status" ON "orders"("status");
CREATE INDEX "idx_orders_paymentStatus" ON "orders"("paymentStatus");

CREATE INDEX "idx_bookings_customerId" ON "bookings"("customerId");
CREATE INDEX "idx_bookings_walkerId" ON "bookings"("walkerId");
CREATE INDEX "idx_bookings_status" ON "bookings"("status");
CREATE INDEX "idx_bookings_date" ON "bookings"("date");

CREATE INDEX "idx_reviews_userId" ON "reviews"("userId");
CREATE INDEX "idx_reviews_productId" ON "reviews"("productId");
CREATE INDEX "idx_reviews_serviceId" ON "reviews"("serviceId");
CREATE INDEX "idx_reviews_walkerId" ON "reviews"("walkerId");
CREATE INDEX "idx_reviews_rating" ON "reviews"("rating");

CREATE INDEX "idx_notifications_userId" ON "notifications"("userId");
CREATE INDEX "idx_notifications_isRead" ON "notifications"("isRead");

CREATE INDEX "idx_banners_position" ON "banners"("position");
CREATE INDEX "idx_banners_isActive" ON "banners"("isActive");

CREATE INDEX "idx_brand_ads_brandId" ON "brand_ads"("brandId");
CREATE INDEX "idx_brand_ads_position" ON "brand_ads"("position");
CREATE INDEX "idx_brand_ads_isActive" ON "brand_ads"("isActive");

CREATE INDEX "idx_recommendations_userId" ON "recommendations"("userId");
CREATE INDEX "idx_recommendations_type" ON "recommendations"("type");

CREATE INDEX "idx_user_analytics_userId" ON "user_analytics"("userId");
CREATE INDEX "idx_user_analytics_event" ON "user_analytics"("event");

-- Crear políticas de seguridad (Row Level Security)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON "users" 
    FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own data" ON "users" 
    FOR UPDATE USING (auth.uid()::text = id::text);

ALTER TABLE "sellers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own data" ON "sellers" 
    FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Sellers can update their own data" ON "sellers" 
    FOR UPDATE USING (auth.uid()::text = userId::text);

ALTER TABLE "walkers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Walkers can view their own data" ON "walkers" 
    FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Walkers can update their own data" ON "walkers" 
    FOR UPDATE USING (auth.uid()::text = userId::text);

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own data" ON "customers" 
    FOR SELECT USING (auth.uid()::text = userId::text);
CREATE POLICY "Customers can update their own data" ON "customers" 
    FOR UPDATE USING (auth.uid()::text = userId::text);

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active products" ON "products" 
    FOR SELECT USING (isActive = true);
CREATE POLICY "Sellers can manage their products" ON "products" 
    FOR ALL USING (auth.uid()::text = sellerId::text);

ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active services" ON "services" 
    FOR SELECT USING (isActive = true);
CREATE POLICY "Walkers can manage their services" ON "services" 
    FOR ALL USING (auth.uid()::text = walkerId::text);

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their orders" ON "orders" 
    FOR SELECT USING (auth.uid()::text = customerId::text);
CREATE POLICY "Sellers can view orders of their products" ON "orders" 
    FOR SELECT USING EXISTS (
        SELECT 1 FROM order_items oi 
        JOIN products p ON oi.productId = p.id 
        WHERE oi.orderId = orders.id AND p.sellerId = auth.uid()::text
    );

ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their bookings" ON "bookings" 
    FOR SELECT USING (auth.uid()::text = customerId::text);
CREATE POLICY "Walkers can view their bookings" ON "bookings" 
    FOR SELECT USING (auth.uid()::text = walkerId::text);

ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active reviews" ON "reviews" 
    FOR SELECT USING (isActive = true);
CREATE POLICY "Users can manage their reviews" ON "reviews" 
    FOR ALL USING (auth.uid()::text = userId::text);

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON "notifications" 
    FOR ALL USING (auth.uid()::text = userId::text);

-- Insertar datos iniciales
-- Configuración del sistema
INSERT INTO "system_configs" ("key", "value", "description") VALUES
    ('site_name', 'PetConnect', 'Nombre del sitio'),
    ('site_description', 'Plataforma para paseadores de mascotas, vendedores y clientes', 'Descripción del sitio'),
    ('admin_email', 'admin@petconnect.com', 'Email del administrador'),
    ('whatsapp_price', '37.00', 'Precio del servicio de WhatsApp'),
    ('seller_commission', '5.00', 'Comisión para vendedores'),
    ('walker_commission', '10.00', 'Comisión para paseadores'),
    ('max_products_per_seller', '50', 'Máximo de productos por vendedor'),
    ('max_products_per_category', '100', 'Máximo de productos por categoría'),
    ('currency_default', 'PEN', 'Moneda por defecto');

-- Monedas
INSERT INTO "currency_configs" ("code", "name", "symbol", "exchangeRate", "isActive", "isDefault") VALUES
    ('PEN', 'Sol Peruano', 'S/', 1.000000, true, true),
    ('USD', 'Dólar Americano', '$', 3.700000, true, false);

-- Categorías de productos iniciales
INSERT INTO "product_categories" ("name", "description", "maxProducts") VALUES
    ('Alimentos', 'Alimentos balanceados para mascotas', 100),
    ('Juguetes', 'Juguetes y entretenimiento para mascotas', 100),
    ('Accesorios', 'Correas, collares, camas y otros accesorios', 100),
    ('Higiene', 'Productos de limpieza y cuidado personal', 100),
    ('Salud', 'Medicamentos y suplementos', 100),
    ('Ropa', 'Vestimenta para mascotas', 50);

-- Marcas iniciales
INSERT INTO "brands" ("name", "description", "isSponsor", "order") VALUES
    ('Royal Canin', 'Alimentos premium para mascotas', true, 1),
    ('Hill''s Science Diet', 'Nutrición científica para mascotas', true, 2),
    ('Pedigree', 'Alimentos y snacks para perros', false, 3),
    ('Whiskas', 'Alimentos y cuidados para gatos', false, 4),
    ('Champion', 'Alimentos superpremium para mascotas', false, 5);

-- Insignias iniciales
INSERT INTO "badges" ("name", "description", "badgeType", "icon", "color", "requirements") VALUES
    ('Vendedor Verificado', 'Vendedor con documentos verificados', 'VERIFIED', '/icons/verified.svg', '#4CAF50', '{"minProducts": 5, "verifiedDocuments": true}'),
    ('Top Vendedor', 'Vendedor con más de 100 ventas', 'TOP_SELLER', '/icons/top-seller.svg', '#FF9800', '{"minSales": 100, "minRating": 4.5}'),
    ('Top Paseador', 'Paseador con más de 50 servicios', 'TOP_WALKER', '/icons/top-walker.svg', '#2196F3', '{"minServices": 50, "minRating": 4.5}'),
    ('Experto', 'Más de 5 años de experiencia', 'EXPERIENCE', '/icons/expert.svg', '#9C27B0', '{"minExperience": 5}'),
    ('Certificado', 'Posee certificaciones profesionales', 'CERTIFIED', '/icons/certified.svg', '#F44336', '{"hasCertifications": true}'),
    ('Confiable', 'Calificación promedio mayor a 4.8', 'RELIABLE', '/icons/reliable.svg', '#00BCD4', '{"minRating": 4.8, "minReviews": 20}'),
    ('Entrega Rápida', 'Entrega en menos de 24 horas', 'FAST_DELIVERY', '/icons/fast-delivery.svg', '#FF5722', '{"avgDeliveryTime": 24}');

-- Banners iniciales
INSERT INTO "banners" ("title", "description", "image", "link", "position", "order") VALUES
    ('¡Bienvenido a PetConnect!', 'La plataforma completa para el cuidado de tus mascotas', '/images/banner-welcome.jpg', '/auth/signup', 'HOME', 1),
    ('Servicios de Paseo', 'Paseadores profesionales para tus mascotas', '/images/banner-walking.jpg', '/auth/signup', 'HOME', 2),
    ('Tienda de Mascotas', 'Productos de calidad para tus amigos', '/images/banner-store.jpg', '/auth/signup', 'HOME', 3);

-- Crear función para generar números de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
    order_number VARCHAR;
    prefix VARCHAR := 'PET';
    sequence_num INTEGER;
BEGIN
    -- Obtener el siguiente número de secuencia
    SELECT COALESCE(MAX(CAST(SUBSTRING(orderNumber, 4) AS INTEGER)), 0) + 1 INTO sequence_num
    FROM orders;
    
    -- Formatear el número de orden
    order_number := prefix || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para generar automáticamente números de orden
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.orderNumber IS NULL THEN
        NEW.orderNumber := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Crear función para actualizar calificaciones promedio
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.isActive = true AND (OLD.isActive IS NULL OR OLD.isActive = false)) THEN
        UPDATE products
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE productId = NEW.productId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.productId;
    ELSIF TG_OP = 'UPDATE' AND NEW.isActive = false AND OLD.isActive = true THEN
        UPDATE products
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE productId = NEW.productId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.productId;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE productId = OLD.productId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = OLD.productId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- Crear función similar para servicios
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.isActive = true AND (OLD.isActive IS NULL OR OLD.isActive = false)) THEN
        UPDATE services
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE serviceId = NEW.serviceId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.serviceId;
    ELSIF TG_OP = 'UPDATE' AND NEW.isActive = false AND OLD.isActive = true THEN
        UPDATE services
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE serviceId = NEW.serviceId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.serviceId;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE services
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE serviceId = OLD.serviceId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = OLD.serviceId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_service_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_service_rating();

-- Crear función para actualizar calificaciones de paseadores
CREATE OR REPLACE FUNCTION update_walker_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.isActive = true AND (OLD.isActive IS NULL OR OLD.isActive = false)) THEN
        UPDATE walkers
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE walkerId = NEW.walkerId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.walkerId;
    ELSIF TG_OP = 'UPDATE' AND NEW.isActive = false AND OLD.isActive = true THEN
        UPDATE walkers
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE walkerId = NEW.walkerId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = NEW.walkerId;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE walkers
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE walkerId = OLD.walkerId AND isActive = true
        ),
        updatedAt = NOW()
        WHERE id = OLD.walkerId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_walker_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_walker_rating();

-- Crear función para actualizar contadores
CREATE OR REPLACE FUNCTION update_product_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products
        SET salesCount = salesCount + 1,
            updatedAt = NOW()
        WHERE id = NEW.productId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_counters
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_counters();

-- Crear función para actualizar contadores de servicios
CREATE OR REPLACE FUNCTION update_service_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE services
        SET bookingCount = bookingCount + 1,
            updatedAt = NOW()
        WHERE id = NEW.serviceId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_service_counters
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_service_counters();

-- Crear función para actualizar totales de vendedores
CREATE OR REPLACE FUNCTION update_seller_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED')) THEN
        UPDATE sellers
        SET totalSales = totalSales + NEW.totalAmount,
            updatedAt = NOW()
        WHERE id = (SELECT sellerId FROM products WHERE id = (SELECT productId FROM order_items WHERE orderId = NEW.id LIMIT 1));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seller_totals
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_totals();

-- Crear función para actualizar totales de paseadores
CREATE OR REPLACE FUNCTION update_walker_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED')) THEN
        UPDATE walkers
        SET totalServices = totalServices + 1,
            totalEarnings = totalEarnings + COALESCE(NEW.walkerPaidAmount, 0),
            updatedAt = NOW()
        WHERE id = NEW.walkerId;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_walker_totals
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_walker_totals();

-- Crear función para verificar y otorgar insignias automáticamente
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    badge_record RECORD;
BEGIN
    -- Obtener información del usuario
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.isActive = true) THEN
        -- Para reviews, verificar insignias de calificación
        IF TG_TABLE_NAME = 'reviews' THEN
            -- Verificar insignia de usuario confiable
            IF NEW.walkerId IS NOT NULL THEN
                SELECT * INTO user_record FROM walkers WHERE userId = NEW.walkerId;
                IF user_record.rating >= 4.8 THEN
                    SELECT * INTO badge_record FROM badges WHERE badgeType = 'RELIABLE';
                    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE userId = NEW.walkerId AND badgeId = badge_record.id) THEN
                        INSERT INTO user_badges (userId, badgeId, awardedBy)
                        VALUES (NEW.walkerId, badge_record.id, auth.uid());
                    END IF;
                END IF;
            END IF;
        END IF;
        
        -- Para productos, verificar insignias de vendedor
        IF TG_TABLE_NAME = 'products' THEN
            -- Verificar insignia de vendedor verificado
            IF NEW.sellerId IS NOT NULL THEN
                SELECT * INTO badge_record FROM badges WHERE badgeType = 'VERIFIED';
                IF NOT EXISTS (SELECT 1 FROM user_badges WHERE userId = NEW.sellerId AND badgeId = badge_record.id) THEN
                    INSERT INTO user_badges (userId, badgeId, awardedBy)
                    VALUES (NEW.sellerId, badge_record.id, auth.uid());
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para otorgar insignias
CREATE TRIGGER trg_award_badges_reviews
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges();

CREATE TRIGGER trg_award_badges_products
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges();

-- Crear función para limpiar notificaciones antiguas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM notifications 
    WHERE createdAt < NOW() - INTERVAL '30 days' 
    AND isRead = true;
END;
$$ LANGUAGE plpgsql;

-- Crear función para generar reportes diarios
CREATE OR REPLACE FUNCTION generate_daily_report()
RETURNS VOID AS $$
DECLARE
    report_data JSONB;
    report_date DATE := CURRENT_DATE;
BEGIN
    -- Generar datos del reporte
    report_data := jsonb_build_object(
        'date', report_date,
        'total_users', (SELECT COUNT(*) FROM users WHERE isActive = true),
        'total_sellers', (SELECT COUNT(*) FROM sellers WHERE isApproved = true),
        'total_walkers', (SELECT COUNT(*) FROM walkers WHERE isApproved = true),
        'total_customers', (SELECT COUNT(*) FROM customers),
        'total_products', (SELECT COUNT(*) FROM products WHERE isActive = true),
        'total_services', (SELECT COUNT(*) FROM services WHERE isActive = true),
        'total_orders', (SELECT COUNT(*) FROM orders WHERE DATE(createdAt) = report_date),
        'total_bookings', (SELECT COUNT(*) FROM bookings WHERE DATE(createdAt) = report_date),
        'total_revenue', (SELECT COALESCE(SUM(totalAmount), 0) FROM orders WHERE DATE(createdAt) = report_date AND status = 'COMPLETED'),
        'active_users_today', (SELECT COUNT(DISTINCT userId) FROM user_analytics WHERE DATE(createdAt) = report_date)
    );
    
    -- Insertar el reporte
    INSERT INTO system_reports (reportType, title, data, generatedAt)
    VALUES ('DAILY', 'Reporte Diario - ' || report_date, report_data, NOW());
END;
$$ LANGUAGE plpgsql;

-- Crear función para verificar disponibilidad de horarios
CREATE OR REPLACE FUNCTION check_schedule_availability(p_walker_id UUID, p_day_of_week INTEGER, p_start_time VARCHAR, p_end_time VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    schedule_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO schedule_count
    FROM schedules
    WHERE walkerId = p_walker_id
    AND dayOfWeek = p_day_of_week
    AND isActive = true
    AND (
        (startTime <= p_start_time AND endTime >= p_start_time) OR
        (startTime <= p_end_time AND endTime >= p_end_time) OR
        (startTime >= p_start_time AND endTime <= p_end_time)
    );
    
    RETURN schedule_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Crear función para recomendar productos
CREATE OR REPLACE FUNCTION recommend_products(p_user_id UUID)
RETURNS TABLE(product_id UUID, score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, 
           CASE 
               WHEN p.isFeatured = true THEN 100.0
               WHEN p.isRecommended = true THEN 80.0
               WHEN p.salesCount > 10 THEN 60.0
               WHEN p.rating >= 4.5 THEN 50.0
               ELSE 30.0
           END +
           (p.viewCount * 0.1) +
           (p.salesCount * 0.5) +
           (p.rating * 10) AS score
    FROM products p
    WHERE p.isActive = true
    ORDER BY score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Crear función para recomendar servicios
CREATE OR REPLACE FUNCTION recommend_services(p_user_id UUID)
RETURNS TABLE(service_id UUID, score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, 
           CASE 
               WHEN s.isFeatured = true THEN 100.0
               WHEN s.isRecommended = true THEN 80.0
               WHEN s.bookingCount > 5 THEN 60.0
               WHEN s.rating >= 4.5 THEN 50.0
               ELSE 30.0
           END +
           (s.viewCount * 0.1) +
           (s.bookingCount * 0.5) +
           (s.rating * 10) AS score
    FROM services s
    WHERE s.isActive = true
    ORDER BY score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Crear vista para estadísticas de usuarios
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.isActive,
    u.createdAt,
    COALESCE(s.totalProducts, 0) as total_products,
    COALESCE(s.totalSales, 0) as total_sales,
    COALESCE(w.totalServices, 0) as total_services,
    COALESCE(w.totalEarnings, 0) as total_earnings,
    COALESCE(w.rating, 0) as walker_rating,
    COALESCE(p.rating, 0) as seller_rating,
    COALESCE((SELECT COUNT(*) FROM reviews WHERE userId = u.id AND isActive = true), 0) as total_reviews,
    COALESCE((SELECT COUNT(*) FROM user_badges WHERE userId = u.id AND isActive = true), 0) as total_badges
FROM users u
LEFT JOIN sellers s ON u.id = s.userId
LEFT JOIN walkers w ON u.id = w.userId
LEFT JOIN (
    SELECT sellerId, AVG(rating) as rating
    FROM reviews r
    JOIN products p ON r.productId = p.id
    WHERE r.isActive = true
    GROUP BY sellerId
) p ON s.id = p.sellerId
LEFT JOIN (
    SELECT walkerId, AVG(rating) as rating
    FROM reviews r
    WHERE r.isActive = true
    GROUP BY walkerId
) wr ON w.id = wr.walkerId;

-- Crear vista para productos populares
CREATE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.images,
    p.viewCount,
    p.salesCount,
    p.rating,
    p.createdAt,
    s.storeName as seller_name,
    c.name as category_name,
    b.name as brand_name,
    (p.viewCount * 0.3 + p.salesCount * 0.5 + p.rating * 0.2) as popularity_score
FROM products p
JOIN sellers s ON p.sellerId = s.id
JOIN product_categories c ON p.categoryId = c.id
LEFT JOIN brands b ON p.brandId = b.id
WHERE p.isActive = true
ORDER BY popularity_score DESC;

-- Crear vista para servicios populares
CREATE VIEW popular_services AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.price,
    s.duration,
    s.viewCount,
    s.bookingCount,
    s.rating,
    s.createdAt,
    w.name as walker_name,
    (s.viewCount * 0.3 + s.bookingCount * 0.5 + s.rating * 0.2) as popularity_score
FROM services s
JOIN walkers w ON s.walkerId = w.id
WHERE s.isActive = true
ORDER BY popularity_score DESC;

-- Crear vista para ingresos mensuales
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', createdAt) as month,
    SUM(CASE WHEN status = 'COMPLETED' THEN totalAmount ELSE 0 END) as total_revenue,
    COUNT(*) as total_orders,
    AVG(CASE WHEN status = 'COMPLETED' THEN totalAmount ELSE 0 END) as avg_order_value
FROM orders
GROUP BY DATE_TRUNC('month', createdAt)
ORDER BY month DESC;

-- Crear vista para actividad de usuarios
CREATE VIEW user_activity AS
SELECT 
    DATE_TRUNC('day', createdAt) as day,
    COUNT(DISTINCT userId) as active_users,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event = 'PAGE_VIEW' THEN 1 END) as page_views,
    COUNT(CASE WHEN event = 'PRODUCT_VIEW' THEN 1 END) as product_views,
    COUNT(CASE WHEN event = 'ADD_TO_CART' THEN 1 END) as add_to_carts,
    COUNT(CASE WHEN event = 'PURCHASE' THEN 1 END) as purchases
FROM user_analytics
GROUP BY DATE_TRUNC('day', createdAt)
ORDER BY day DESC;

-- Completar la creación del esquema
-- Este esquema está listo para usar con la aplicación PetConnect