-- Esquema completo para Supabase - PetConnect Platform
-- Generado desde Prisma Schema

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'WALKER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "ServiceStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

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
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tabla de Categorías de Productos
CREATE TABLE "product_categories" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN DEFAULT true,
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
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE
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
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE
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
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
    FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("walkerId") REFERENCES "walkers"("id") ON DELETE CASCADE
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
    "isActive" BOOLEAN DEFAULT true,
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

-- Tabla de Configuración del Sistema
CREATE TABLE "system_configs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE INDEX "services_walkerId_idx" ON "services"("walkerId");
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");
CREATE INDEX "bookings_walkerId_idx" ON "bookings"("walkerId");
CREATE INDEX "bookings_serviceId_idx" ON "bookings"("serviceId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_date_idx" ON "bookings"("date");
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_serviceId_idx" ON "reviews"("serviceId");
CREATE INDEX "reviews_walkerId_idx" ON "reviews"("walkerId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

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
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON "product_categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON "system_configs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo iniciales
-- Categorías de productos
INSERT INTO "product_categories" ("id", "name", "description", "image") VALUES
(uuid_generate_v4(), 'Alimentos para Mascotas', 'Comida balanceada y nutritiva para tus mascotas', '/images/categories/food.jpg'),
(uuid_generate_v4(), 'Accesorios', 'Collares, correas, juguetes y más', '/images/categories/accessories.jpg'),
(uuid_generate_v4(), 'Salud y Cuidado', 'Productos de higiene y salud para mascotas', '/images/categories/health.jpg'),
(uuid_generate_v4(), 'Camas y Casas', 'Espacios cómodos para descansar', '/images/categories/beds.jpg');

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
INSERT INTO "sellers" ("id", "userId", "storeName", "description", "isApproved") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'seller@petconnect.com'), 'Mascotas Felices', 'La mejor tienda para tus mascotas', true);

-- Paseador
INSERT INTO "walkers" ("id", "userId", "name", "description", "experience", "pricePerHour", "isApproved") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'walker@petconnect.com'), 'Carlos Rodríguez', 'Paseador profesional con 5 años de experiencia', 5, 15.00, true);

-- Cliente
INSERT INTO "customers" ("id", "userId") VALUES
(uuid_generate_v4(), (SELECT id FROM "users" WHERE email = 'customer@petconnect.com'));

-- Productos de ejemplo
INSERT INTO "products" ("id", "name", "description", "price", "stock", "sellerId", "categoryId") VALUES
(uuid_generate_v4(), 'Alimento Premium para Perros', 'Comida balanceada para perros adultos', 25.99, 50, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Alimentos para Mascotas')),
(uuid_generate_v4(), 'Juguete Interactivo para Gatos', 'Juguete con pluma y campana', 12.50, 30, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Accesorios')),
(uuid_generate_v4(), 'Champú para Mascotas', 'Champú hipoalergénico', 8.99, 25, (SELECT id FROM "sellers" WHERE storeName = 'Mascotas Felices'), (SELECT id FROM "product_categories" WHERE name = 'Salud y Cuidado'));

-- Servicios de ejemplo
INSERT INTO "services" ("id", "name", "description", "price", "duration", "walkerId") VALUES
(uuid_generate_v4(), 'Paseo de 30 minutos', 'Paseo corto para mascotas pequeñas', 10.00, 30, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez')),
(uuid_generate_v4(), 'Paseo de 1 hora', 'Paseo completo en el parque', 15.00, 60, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez')),
(uuid_generate_v4(), 'Paseo de 2 horas', 'Paseo extendido con tiempo de juego', 25.00, 120, (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'));

-- Horarios de ejemplo
INSERT INTO "schedules" ("id", "walkerId", "dayOfWeek", "startTime", "endTime") VALUES
(uuid_generate_v4(), (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), 1, '08:00', '18:00'), -- Lunes
(uuid_generate_v4(), (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), 3, '08:00', '18:00'), -- Miércoles
(uuid_generate_v4(), (SELECT id FROM "walkers" WHERE name = 'Carlos Rodríguez'), 5, '08:00', '18:00'); -- Viernes

-- Configuración del sistema
INSERT INTO "system_configs" ("id", "key", "value", "description") VALUES
(uuid_generate_v4(), 'site_name', 'PetConnect', 'Nombre del sitio'),
(uuid_generate_v4(), 'site_description', 'Plataforma para amantes de mascotas', 'Descripción del sitio'),
(uuid_generate_v4(), 'commission_rate', '0.10', 'Tasa de comisión por defecto'),
(uuid_generate_v4(), 'currency', 'USD', 'Moneda por defecto'),
(uuid_generate_v4(), 'min_withdrawal', '50.00', 'Monto mínimo de retiro'),
(uuid_generate_v4(), 'support_email', 'support@petconnect.com', 'Email de soporte');