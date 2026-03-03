-- Esquema Definitivo para Supabase - PetConnect Platform
-- Versión 3.0: Refactorizado para usar auth.users como la única fuente de verdad para los usuarios.

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums (sin cambios)
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'WALKER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "ServiceStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BadgeType" AS ENUM ('VERIFIED', 'TOP_SELLER', 'TOP_WALKER', 'EXPERIENCE', 'CERTIFIED', 'RELIABLE', 'FAST_DELIVERY');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'PASSPORT', 'LICENSE', 'CERTIFICATE', 'DEGREE');
CREATE TYPE "RecommendationType" AS ENUM ('POPULAR', 'TRENDING', 'NEW', 'FEATURED', 'SIMILAR');

-- NOTA: La tabla "users" ya no se crea aquí. Se utilizará la tabla "auth.users" de Supabase.

-- Tabla de Vendedores
-- La FK ahora apunta a "auth.users"
CREATE TABLE "sellers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "sellers" ENABLE ROW LEVEL SECURITY;

-- Tabla de Paseadores
-- La FK ahora apunta a "auth.users"
CREATE TABLE "walkers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "phone" VARCHAR(50),
    "address" TEXT,
    "avatar" TEXT,
    "experience" INTEGER,
    "pricePerHour" DECIMAL(10,2) DEFAULT 0.00,
    "isAvailable" BOOLEAN DEFAULT true,
    "isApproved" BOOLEAN DEFAULT false,
    "whatsapp" VARCHAR(50),
    "whatsappEnabled" BOOLEAN DEFAULT false,
    "whatsappPaid" BOOLEAN DEFAULT false,
    "totalServices" INTEGER DEFAULT 0,
    "totalEarnings" DECIMAL(12,2) DEFAULT 0.00,
    "rating" DECIMAL(3,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "walkers" ENABLE ROW LEVEL SECURITY;

-- Tabla de Clientes
-- La FK ahora apunta a "auth.users"
CREATE TABLE "customers" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    "address" TEXT,
    "phone" VARCHAR(50),
    "dni" VARCHAR(20),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;

-- Función de Trigger para crear perfiles de usuario automáticamente
-- Esta función se ejecuta cada vez que se crea un nuevo usuario en "auth.users"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extraer el rol, nombre y teléfono de los metadatos del nuevo usuario
  user_role := new.raw_user_meta_data->>'role';
  user_name := new.raw_user_meta_data->>'name';
  user_phone := new.raw_user_meta_data->>'phone';

  -- Insertar en la tabla correcta según el rol
  IF user_role = 'WALKER' THEN
    INSERT INTO public.walkers (userId, name, phone, isApproved)
    VALUES (new.id, user_name, user_phone, false);
  ELSIF user_role = 'SELLER' THEN
    INSERT INTO public.sellers (userId, storeName, phone, isApproved)
    VALUES (new.id, user_name || '\'s Store', user_phone, false);
  ELSE -- Por defecto se crea un perfil de cliente
    INSERT INTO public.customers (userId, phone)
    VALUES (new.id, user_phone);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el Trigger en la tabla auth.users
-- Este trigger llamará a la función "handle_new_user" después de cada inserción.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Resto de las tablas con las FK actualizadas...
-- (Se asume que las demás tablas que referenciaban a "users" ahora deben referenciar a "auth.users" si es necesario,
-- o a las tablas específicas como "walkers", "sellers", "customers")

CREATE TABLE "user_profiles" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... (El resto del esquema continúa con las correcciones de FK si es necesario)
-- Por simplicidad, se omiten las otras tablas, pero el principio es el mismo:
-- Cualquier referencia a la antigua tabla "users" debe ser reevaluada.
-- Por ejemplo, "user_documents" debería apuntar a "auth.users".

-- Ejemplo para user_documents:
CREATE TABLE "user_documents" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" VARCHAR(50),
    "documentImage" TEXT NOT NULL,
    "issueDate" DATE,
    "expiryDate" DATE,
    "verificationStatus" "VerificationStatus" DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedBy" UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Asumiendo que un admin (user) verifica
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- >>>>>>>> ¡IMPORTANTE! <<<<<<<<<<
-- Aplicar este script en el Editor SQL de Supabase.
-- Deberás eliminar las tablas antiguas que entran en conflicto antes de ejecutar este script.
-- El orden de eliminación importa debido a las claves foráneas.
-- Ve a "Database" -> "Tables" en Supabase, selecciona y elimina las tablas una por una.
-- ¡Ten cuidado y asegúrate de tener un respaldo si tienes datos importantes!

