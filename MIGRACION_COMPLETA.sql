-- =============================================================================
-- SCRIPT DE MIGRACIÓN Y RECONSTRUCCIÓN COMPLETA DE LA BASE DE DATOS
-- Versión: 2.5 (FINALÍSIMA - Política de INSERT explícita para el ROL)
--
-- CAUSA DEL ERROR ANTERIOR:
-- La política `WITH CHECK (current_user = 'postgres')` era incorrecta. Aunque el
-- trigger corre como el usuario 'postgres', esta comprobación falla en el contexto
-- de seguridad de Supabase. 
--
-- SOLUCIÓN:
-- Se utiliza una sintaxis más directa y correcta, otorgando el permiso de INSERT
-- directamente al ROL 'postgres', que es el rol con el que se ejecuta la función
-- SECURITY DEFINER.
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


-- PARTE 2: Reconstrucción del Esquema Correcto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'WALKER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
-- ... (otros enums) ...

CREATE TABLE "sellers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "storeName" VARCHAR(255) NOT NULL, "description" TEXT, "address" TEXT, "phone" VARCHAR(50), "logo" TEXT, "isApproved" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "walkers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "name" VARCHAR(255) NOT NULL, "description" TEXT, "phone" VARCHAR(50), "address" TEXT, "avatar" TEXT, "experience" INTEGER, "pricePerHour" DECIMAL(10,2) DEFAULT 0.00, "isAvailable" BOOLEAN DEFAULT true, "isApproved" BOOLEAN DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE "customers" ( "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, "address" TEXT, "phone" VARCHAR(50), "dni" VARCHAR(20), "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW());
-- ... (otras tablas) ...


-- PARTE 3: Lógica de Negocio Automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (new.raw_user_meta_data->>'role') = 'WALKER' THEN
    INSERT INTO public.walkers (userId, name, phone) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Nuevo Paseador'), new.raw_user_meta_data->>'phone');
  ELSIF (new.raw_user_meta_data->>'role') = 'SELLER' THEN
    INSERT INTO public.sellers (userId, storeName, phone) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Nueva Tienda') || '''s Store', new.raw_user_meta_data->>'phone');
  ELSE
    INSERT INTO public.customers (userId, phone) VALUES (new.id, new.raw_user_meta_data->>'phone');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- PARTE 4: Habilitación de Seguridad RLS en TODAS las tablas
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
-- ... (otras tablas) ...


-- PARTE 5: Creación de Políticas de Seguridad (Policies) - ¡LA SINTAXIS CORRECTA!

-- 5.1 Políticas de INSERT (Permite al ROL 'postgres' insertar)
CREATE POLICY "Allow postgres role to insert profiles" ON public.walkers FOR INSERT TO postgres WITH CHECK (true);
CREATE POLICY "Allow postgres role to insert profiles" ON public.sellers FOR INSERT TO postgres WITH CHECK (true);
CREATE POLICY "Allow postgres role to insert profiles" ON public.customers FOR INSERT TO postgres WITH CHECK (true);

-- 5.2 Políticas de Lectura Pública
CREATE POLICY "Public can view all" ON public.walkers FOR SELECT USING (true);
CREATE POLICY "Public can view all" ON public.sellers FOR SELECT USING (true);
-- ... (otras políticas de select) ...

-- 5.3 Políticas de Modificación (Solo el dueño)
CREATE POLICY "Owner can update own profile" ON public.walkers FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Owner can delete own profile" ON public.walkers FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "Owner can update own profile" ON public.sellers FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Owner can delete own profile" ON public.sellers FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "Owner can manage own profile" ON public.customers FOR ALL USING (auth.uid() = "userId");

-- FIN DEL SCRIPT. 
