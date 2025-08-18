# Guía de Configuración de Supabase para PetConnect

## 1. Obtener Credenciales de Supabase

### Paso 1: Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Regístrate o inicia sesión
3. Crea un nuevo proyecto:
   - Nombre del proyecto: `petconnect`
   - Contraseña de la base de datos: elige una segura
   - Región: elige la más cercana a tus usuarios

### Paso 2: Obtener las credenciales
Una vez creado el proyecto, ve a:
1. **Project Settings** → **API**
2. Copia las siguientes credenciales:

```
Project URL: https://tu-proyecto-id.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Configurar Variables de Entorno

Abre tu archivo `.env` y reemplaza los valores placeholder:

```env
# Database Configuration
DATABASE_URL=file:/home/z/my-project/db/custom.db

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: For production
NODE_ENV=development
```

## 3. Ejecutar el SQL en Supabase

### Paso 1: Ir al Editor SQL
1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva consulta

### Paso 2: Copiar y ejecutar el SQL
Copia el contenido del archivo `supabase-schema-complete.sql` y pégalo en el editor SQL.
Haz clic en **Run** para ejecutar todas las tablas.

## 4. Configurar Row Level Security (RLS)

Supabase habilita RLS por defecto. Necesitas crear políticas para permitir el acceso:

### Ejecutar estas políticas SQL:

```sql
-- Habilitar acceso anónimo a las tablas públicas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- Políticas para usuarios autenticados
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sellers can manage their products" ON products
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Walkers can manage their services" ON services
  FOR ALL USING (auth.uid() = walker_id);
```

## 5. Probar la Conexión

### Verificar conexión desde el frontend:

```typescript
import { supabase, checkSupabaseConnection } from '@/lib/supabase'

// En tu componente o página
useEffect(() => {
  const testConnection = async () => {
    const isConnected = await checkSupabaseConnection()
    if (isConnected) {
      console.log('✅ Conexión a Supabase exitosa')
    } else {
      console.error('❌ Error conectando a Supabase')
    }
  }
  testConnection()
}, [])
```

### Ejemplo de uso en componentes:

```typescript
// Obtener productos
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)

// Obtener perfil del usuario
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

## 6. Configurar Storage para Imágenes

### Crear buckets de storage:
1. Ve a **Storage** en el dashboard de Supabase
2. Crea los siguientes buckets:
   - `products` (para imágenes de productos)
   - `profiles` (para fotos de perfil)
   - `services` (para imágenes de servicios)
   - `banners` (para banners de marketing)

### Configurar políticas de storage:
```sql
-- Políticas para storage
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products', 'profiles', 'services', 'banners'));

CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('products', 'profiles', 'services') 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 7. Variables de Entorno para Producción (Vercel)

Cuando despliegues en Vercel, agrega estas variables en tu configuración:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secreto-seguro
```

## 8. Troubleshooting Común

### Problema: "Connection refused"
- Verifica que la URL de Supabase sea correcta
- Revisa que las claves API sean válidas

### Problema: "Permission denied"
- Verifica las políticas RLS
- Asegúrate de que el usuario esté autenticado

### Problema: "Table not found"
- Ejecuta el SQL completo en el editor de Supabase
- Verifica que todas las tablas se crearon correctamente

### Problema: "CORS error"
- Configura los CORS en la configuración de Supabase
- Agrega tu dominio a la lista de permitidos

## 9. Funciones Útiles

### Subir imágenes:
```typescript
const uploadImage = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  return data
}
```

### Obtener URL de imagen:
```typescript
const getImageUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}
```

## 10. Checklist Final

- [ ] Crear proyecto en Supabase
- [ ] Obtener credenciales API
- [ ] Configurar variables de entorno (.env)
- [ ] Ejecutar SQL del esquema completo
- [ ] Configurar políticas RLS
- [ ] Crear buckets de storage
- [ ] Probar conexión desde la aplicación
- [ ] Verificar todas las funcionalidades
- [ ] Configurar variables para producción

¡Con esto tu aplicación PetConnect estará completamente conectada a Supabase!