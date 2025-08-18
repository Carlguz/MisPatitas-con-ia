import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

async function main() {
  try {
    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await db.user.create({
      data: {
        email: 'admin@petconnect.com',
        password: hashedPassword,
        name: 'Administrador',
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: true
      }
    })

    console.log('Usuario administrador creado:', adminUser)

    // Crear usuario vendedor de ejemplo
    const sellerPassword = await bcrypt.hash('seller123', 12)
    
    const sellerUser = await db.user.create({
      data: {
        email: 'seller@petconnect.com',
        password: sellerPassword,
        name: 'Vendedor Ejemplo',
        role: UserRole.SELLER,
        isActive: true,
        emailVerified: true
      }
    })

    const sellerProfile = await db.seller.create({
      data: {
        userId: sellerUser.id,
        storeName: 'Pet Store Pro',
        description: 'Los mejores productos para tus mascotas',
        isApproved: true
      }
    })

    console.log('Usuario vendedor creado:', sellerUser)
    console.log('Perfil de vendedor creado:', sellerProfile)

    // Crear usuario paseador de ejemplo
    const walkerPassword = await bcrypt.hash('walker123', 12)
    
    const walkerUser = await db.user.create({
      data: {
        email: 'walker@petconnect.com',
        password: walkerPassword,
        name: 'Paseador Ejemplo',
        role: UserRole.WALKER,
        isActive: true,
        emailVerified: true
      }
    })

    const walkerProfile = await db.walker.create({
      data: {
        userId: walkerUser.id,
        name: 'Carlos Rodríguez',
        description: 'Paseador profesional con 5 años de experiencia',
        phone: '+1234567890',
        address: 'Calle Principal 123',
        experience: 5,
        pricePerHour: 15,
        isAvailable: true,
        isApproved: true
      }
    })

    console.log('Usuario paseador creado:', walkerUser)
    console.log('Perfil de paseador creado:', walkerProfile)

    // Crear usuario cliente de ejemplo
    const customerPassword = await bcrypt.hash('customer123', 12)
    
    const customerUser = await db.user.create({
      data: {
        email: 'customer@petconnect.com',
        password: customerPassword,
        name: 'Cliente Ejemplo',
        role: UserRole.CUSTOMER,
        isActive: true,
        emailVerified: true
      }
    })

    const customerProfile = await db.customer.create({
      data: {
        userId: customerUser.id,
        phone: '+1234567891',
        address: 'Calle Secundaria 456'
      }
    })

    console.log('Usuario cliente creado:', customerUser)
    console.log('Perfil de cliente creado:', customerProfile)

    // Crear categorías de productos
    const categories = await Promise.all([
      db.productCategory.create({
        data: {
          name: 'Comida para Mascotas',
          description: 'Alimentos balanceados para perros y gatos'
        }
      }),
      db.productCategory.create({
        data: {
          name: 'Juguetes',
          description: 'Juguetes interactivos y divertidos'
        }
      }),
      db.productCategory.create({
        data: {
          name: 'Accesorios',
          description: 'Correas, collares, camas y más'
        }
      })
    ])

    console.log('Categorías creadas:', categories)

    // Crear productos de ejemplo
    const products = await Promise.all([
      db.product.create({
        data: {
          name: 'Comida Premium para Perros',
          description: 'Alimento balanceado de alta calidad para perros adultos',
          price: 25.99,
          stock: 50,
          sellerId: sellerProfile.id,
          categoryId: categories[0].id
        }
      }),
      db.product.create({
        data: {
          name: 'Juguete Interactivo para Gatos',
          description: 'Mantén a tu gato entretenido por horas',
          price: 12.99,
          stock: 30,
          sellerId: sellerProfile.id,
          categoryId: categories[1].id
        }
      }),
      db.product.create({
        data: {
          name: 'Correa Ajustable',
          description: 'Correa resistente y cómoda para paseos seguros',
          price: 18.50,
          stock: 15,
          sellerId: sellerProfile.id,
          categoryId: categories[2].id
        }
      })
    ])

    console.log('Productos creados:', products)

    // Crear servicios de paseo
    const services = await Promise.all([
      db.service.create({
        data: {
          name: 'Paseo Básico',
          description: 'Paseo de 30 minutos por el parque',
          price: 15,
          duration: 30,
          walkerId: walkerProfile.id
        }
      }),
      db.service.create({
        data: {
          name: 'Paseo Extendido',
          description: 'Paseo de 60 minutos con tiempo extra de juego',
          price: 25,
          duration: 60,
          walkerId: walkerProfile.id
        }
      }),
      db.service.create({
        data: {
          name: 'Paseo Premium',
          description: 'Paseo de 90 minutos con entrenamiento básico',
          price: 40,
          duration: 90,
          walkerId: walkerProfile.id
        }
      })
    ])

    console.log('Servicios creados:', services)

    // Crear horarios del paseador
    const schedules = await Promise.all([
      db.schedule.create({
        data: {
          walkerId: walkerProfile.id,
          dayOfWeek: 1, // Lunes
          startTime: '08:00',
          endTime: '18:00'
        }
      }),
      db.schedule.create({
        data: {
          walkerId: walkerProfile.id,
          dayOfWeek: 2, // Martes
          startTime: '08:00',
          endTime: '18:00'
        }
      }),
      db.schedule.create({
        data: {
          walkerId: walkerProfile.id,
          dayOfWeek: 3, // Miércoles
          startTime: '08:00',
          endTime: '18:00'
        }
      }),
      db.schedule.create({
        data: {
          walkerId: walkerProfile.id,
          dayOfWeek: 4, // Jueves
          startTime: '08:00',
          endTime: '18:00'
        }
      }),
      db.schedule.create({
        data: {
          walkerId: walkerProfile.id,
          dayOfWeek: 5, // Viernes
          startTime: '08:00',
          endTime: '18:00'
        }
      })
    ])

    console.log('Horarios creados:', schedules)

    // Crear enlaces sociales del paseador
    const socialLinks = await Promise.all([
      db.socialLink.create({
        data: {
          walkerId: walkerProfile.id,
          platform: 'instagram',
          url: 'https://instagram.com/petwalker'
        }
      }),
      db.socialLink.create({
        data: {
          walkerId: walkerProfile.id,
          platform: 'facebook',
          url: 'https://facebook.com/petwalker'
        }
      }),
      db.socialLink.create({
        data: {
          walkerId: walkerProfile.id,
          platform: 'twitter',
          url: 'https://twitter.com/petwalker'
        }
      })
    ])

    console.log('Enlaces sociales creados:', socialLinks)

    // Crear configuraciones del sistema
    const systemConfigs = await Promise.all([
      db.systemConfig.create({
        data: {
          key: 'platform_commission_rate',
          value: '10',
          description: 'Porcentaje de comisión de la plataforma'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'tax_rate',
          value: '16',
          description: 'Porcentaje de impuestos'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'min_withdrawal_amount',
          value: '50',
          description: 'Monto mínimo de retiro'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'max_booking_distance',
          value: '10',
          description: 'Distancia máxima de reserva en km'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'platform_name',
          value: 'PetConnect',
          description: 'Nombre de la plataforma'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'platform_email',
          value: 'info@petconnect.com',
          description: 'Email de la plataforma'
        }
      }),
      db.systemConfig.create({
        data: {
          key: 'platform_phone',
          value: '+1234567890',
          description: 'Teléfono de la plataforma'
        }
      })
    ])

    console.log('Configuraciones del sistema creadas:', systemConfigs)

    console.log('¡Base de datos inicializada exitosamente!')
    console.log('Credenciales de prueba:')
    console.log('Administrador: admin@petconnect.com / admin123')
    console.log('Vendedor: seller@petconnect.com / seller123')
    console.log('Paseador: walker@petconnect.com / walker123')
    console.log('Cliente: customer@petconnect.com / customer123')

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })