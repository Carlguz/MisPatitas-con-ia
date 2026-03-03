-- =============================================================================
-- SCRIPT DE MIGRACIÓN Y RECONSTRUCCIÓN COMPLETA DE LA BASE DE DATOS
-- Versión: 2.3 (FINAL - Políticas RLS explícitas y correctas)
--
-- CAUSA DEL ERROR ANTERIOR:
-- Las políticas "FOR ALL" eran demasiado ambiguas. Para la inserción (INSERT)
-- actuaban como un "WITH CHECK" usando auth.uid(). En el contexto del trigger,
-- auth.uid() es nulo, lo que hacía fallar la política y revertía la transacción.
--
-- SOLUCIÓN:
-- Se reemplazan las políticas "FOR ALL" por políticas explícitas para SELECT, 
-- UPDATE y DELETE. No se crea una política de INSERT para los usuarios, confiando
-- en que el trigger (con SECURITY DEFINER) se salte RLS para realizar la inserción.
-- =============================================================================


-- PARTE 1: Limpieza completa del esquema antiguo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."OrderStatus";
DROP TYPE IF EXISTS public."PaymentStatus";
DROP TYPE IF EXISTS public."ServiceStatus";
DROP TYPE IF EXISTS public."BadgeType";
DROP TYPE IF EXISTS public."VerificationStatus";
DROP TYPE IF EXISTS public."DocumentType";
DROP TYPE IF EXISTS public."RecommendationType";


-- PARTE 2: Reconstrucción del Esquema Correcto (Sin cambios)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'WALKER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "ServiceStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BadgeType" AS ENUM ('VERIFIED', 'TOP_SELLER', 'TOP_WALKER', 'EXPERIENCE', 'CERTIFIED', 'RELIABLE', 'FAST_DELIVERY');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'PASSPORT', 'LICENSE', 'CERTIFICATE', 'DEGREE');
CREATE TYPE "RecommendationType" AS ENUM ('POPULAR', 'TRENDING', 'NEW', 'FEATURED', 'SIMILAR');

CREATE TABLE "sellers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "storeName" VARCHAR(255) NOT NULL, "description" TEXT, "address" TEXT, "phone" VARCHAR(50), "logo" TEXT, "isApproved" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "walkers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "name" VARCHAR(255) NOT NULL, "description" TEXT, "phone" VARCHAR(50), "address" TEXT, "avatar" TEXT, "experience" INTEGER, "pricePerHour" DECIMAL(10,2) DEFAULT 0.00, "isAvailable" BOOLEAN DEFAULT true, "isApproved" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "customers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "address" TEXT, "phone" VARCHAR(50), "dni" VARCHAR(20), "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "product_categories" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "name" VARCHAR(255) NOT NULL UNIQUE, "image" TEXT, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "brands" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "name" VARCHAR(255) NOT NULL UNIQUE, "logo" TEXT, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "products" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "description" TEXT, "price" DECIMAL(10,2) NOT NULL, "stock" INTEGER DEFAULT 0, "images" TEXT, "isActive" BOOLEAN DEFAULT true, "sellerId" UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE, "categoryId" UUID REFERENCES product_categories(id) ON DELETE SET NULL, "brandId" UUID REFERENCES brands(id) ON DELETE SET NULL, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "services" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "name" VARCHAR(255) NOT NULL, "description" TEXT, "price" DECIMAL(10,2) NOT NULL, "duration" INTEGER NOT NULL, "isActive" BOOLEAN DEFAULT true, "walkerId" UUID NOT NULL REFERENCES walkers(id) ON DELETE CASCADE, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- PARTE 3: Lógica de Negocio Automática (Función y Trigger ROBUSTO, sin cambios)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_phone TEXT;
BEGIN
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER');
  user_name := COALESCE(new.raw_user_meta_data->>'name', 'Nuevo Usuario');
  user_phone := new.raw_user_meta_data->>'phone';

  IF user_role = 'WALKER' THEN
    INSERT INTO public.walkers (userId, name, phone) VALUES (new.id, user_name, user_phone);
  ELSIF user_role = 'SELLER' THEN
    INSERT INTO public.sellers (userId, storeName, phone) VALUES (new.id, user_name || '''s Store', user_phone);
  ELSE
    INSERT INTO public.customers (userId, phone) VALUES (new.id, user_phone);
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- PARTE 4: Habilitación de Seguridad RLS en TODAS las tablas (Sin cambios)
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;


-- PARTE 5: Creación de Políticas de Seguridad (Policies) - ¡CORREGIDAS!

-- 5.1 Políticas de Lectura Pública (Cualquiera puede ver)
CREATE POLICY "Public can view all" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.walkers FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.brands FOR SELECT USING (true);

-- 5.2 Políticas de Modificación (Solo el dueño puede modificar o borrar sus cosas)

-- Para Vendedores (Sellers)
CREATE POLICY "Owner can update their own profile" ON public.sellers FOR UPDATE USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Owner can delete their own profile" ON public.sellers FOR DELETE USING (auth.uid() = "userId");

-- Para Paseadores (Walkers)
CREATE POLICY "Owner can update their own profile" ON public.walkers FOR UPDATE USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Owner can delete their own profile" ON public.walkers FOR DELETE USING (auth.uid() = "userId");

-- Para Clientes (Customers)
CREATE POLICY "Owner can manage their own profile" ON public.customers FOR ALL USING (auth.uid() = "userId"); -- ALL está bien aquí, es más simple.

-- Para Productos y Servicios
CREATE POLICY "Seller can manage their own products" ON public.products FOR ALL USING (auth.uid() = (SELECT "userId" FROM sellers WHERE id = "sellerId"));
CREATE POLICY "Walker can manage their own services" ON public.services FOR ALL USING (auth.uid() = (SELECT "userId" FROM walkers WHERE id = "walkerId"));


-- FIN DEL SCRIPT. ¡Base de datos limpia, reestructurada y segura de verdad!
