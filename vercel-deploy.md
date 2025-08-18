# Guía de Despliegue en Vercel - PetConnect Platform

## Pasos para desplegar la aplicación en Vercel

---

## 1. Preparación del Proyecto

### 1.1. Verificar dependencias
```bash
npm install
```

### 1.2. Generar Prisma Client
```bash
npx prisma generate
```

### 1.3. Construir la aplicación
```bash
npm run build
```

---

## 2. Configuración de Variables de Entorno en Vercel

### 2.1. Variables requeridas
En el dashboard de Vercel, ve a `Settings > Environment Variables` y añade:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.vercel.app"
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

# Z-AI SDK (para funcionalidades de IA)
ZAI_API_KEY="tu_zai_api_key"
```

### 2.2. Configuración de la base de datos
Si usas Supabase, tu `DATABASE_URL` debería verse así:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```

---

## 3. Configuración de Prisma para Vercel

### 3.1. Actualizar schema.prisma
Asegúrate que tu `prisma/schema.prisma` esté configurado para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3.2. Generar cliente para producción
```bash
npx prisma generate
```

### 3.3. Push del esquema a la base de datos
```bash
npx prisma db push
```

---

## 4. Despliegue en Vercel

### 4.1. Conectar con Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### 4.2. Conectar repositorio a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona tu repositorio
5. Configura las variables de entorno
6. Haz clic en "Deploy"

### 4.3. Despliegue automático
Vercel automáticamente detectará que es una aplicación Next.js y la desplegará con la configuración adecuada.

---

## 5. Configuración Post-Despliegue

### 5.1. Ejecutar migraciones en producción
Después del despliegue, necesitas ejecutar las migraciones en la base de datos:

```bash
npx prisma db push
```

O si prefieres usar migraciones:
```bash
npx prisma migrate deploy
```

### 5.2. Verificar la aplicación
Visita la URL proporcionada por Vercel y verifica que todo funcione correctamente.

---

## 6. Configuración de Dominio Personalizado

### 6.1. Añadir dominio
1. En el dashboard de Vercel, ve a `Settings > Domains`
2. Añade tu dominio (ej: `petconnect.com`)
3. Sigue las instrucciones para configurar los DNS

### 6.2. Configurar SSL
Vercel automáticamente proporcionará certificados SSL para tu dominio.

---

## 7. Monitoreo y Logs

### 7.1. Ver logs
En el dashboard de Vercel, puedes ver los logs de tu aplicación en la sección `Logs`.

### 7.2. Monitoreo de errores
Vercel proporciona monitoreo de errores básico. Para monitoreo avanzado, considera integrar servicios como:
- Sentry
- LogRocket
- Datadog

---

## 8. Configuración de Webhooks

### 8.1. Webhook de Stripe
Si usas Stripe para pagos, necesitas configurar el webhook:

1. En el dashboard de Stripe, ve a `Developers > Webhooks`
2. Añade un nuevo endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Selecciona los eventos que quieres escuchar
4. Copia el webhook secret y añádelo a tus variables de entorno

### 8.2. Webhook de NextAuth
NextAuth requiere un webhook para manejar eventos de OAuth:

1. Añade esta URL a tu configuración de OAuth: `https://tu-dominio.vercel.app/api/auth/[...nextauth]`

---

## 9. Optimización para Producción

### 9.1. Configurar caché
Añade esto a tu `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com'], // Añade los dominios de tus imágenes
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = nextConfig
```

### 9.2. Configurar headers
Añade esto a tu `next.config.js` para mejorar la seguridad:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ]
}
```

---

## 10. Solución de Problemas Comunes

### 10.1. Error de conexión a la base de datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate que la base de datos sea accesible desde Vercel
- Verifica las credenciales de la base de datos

### 10.2. Error de autenticación
- Verifica que `NEXTAUTH_SECRET` sea correcto
- Asegúrate que `NEXTAUTH_URL` coincida con tu dominio
- Verifica las configuraciones de OAuth

### 10.3. Error de CORS
- Asegúrate que las APIs estén configuradas para aceptar peticiones de tu dominio
- Verifica las configuraciones de seguridad en tu base de datos

### 10.4. Error de compilación
- Verifica que todas las dependencias estén instaladas
- Asegúrate que no haya errores de TypeScript
- Verifica las rutas de importación

---

## 11. Script de Despliegue Automatizado

Crea un script `deploy.sh` para automatizar el despliegue:

```bash
#!/bin/bash

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Construir la aplicación
npm run build

# Hacer commit y push
git add .
git commit -m "Deploy: $(date)"
git push origin main
```

Hazlo ejecutable:
```bash
chmod +x deploy.sh
```

---

## 12. Checklist de Despliegue

- [ ] Configurar variables de entorno en Vercel
- [ ] Actualizar `DATABASE_URL` para producción
- [ ] Generar Prisma Client para producción
- [ ] Ejecutar migraciones en la base de datos
- [ ] Verificar que todas las APIs funcionen
- [ ] Probar el flujo de autenticación
- [ ] Probar el flujo de pagos
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL
- [ ] Probar webhooks
- [ ] Verificar logs y monitoreo
- [ ] Optimizar para producción

---

## 13. Comandos Útiles

```bash
# Verificar estado del despliegue
vercel ls

# Ver logs en tiempo real
vercel logs

# Eliminar despliegue
vercel rm [deployment-url]

# Verificar variables de entorno
vercel env ls

# Añadir variable de entorno
vercel env add NEXTAUTH_SECRET
```

---

## 14. Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de NextAuth](https://next-auth.js.org/)

---

## 15. Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs en el dashboard de Vercel
2. Verifica la documentación oficial
3. Busca soluciones en Stack Overflow
4. Contacta al soporte de Vercel si es necesario

¡Tu aplicación PetConnect estará lista para producción en Vercel!