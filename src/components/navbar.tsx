'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Store, Dog, Users, LogOut, Settings } from 'lucide-react'
import { CurrencySelector } from '@/components/currency-selector'

// Definimos el tipo UserRole directamente aquí
export type UserRole = "ADMIN" | "SELLER" | "WALKER" | "CUSTOMER";

// Definimos una interfaz para el perfil del usuario
interface UserProfile {
  name?: string | null;
  avatar?: string | null;
  role?: UserRole | null;
}

export function Navbar() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session },} = await supabase.auth.getSession();
      setSession(session)

      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, avatar_url, role')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
        } else if (profile) {
          setUserProfile({
            name: profile.name,
            avatar: profile.avatar_url,
            role: profile.role as UserRole,
          })
        }
      }
      setLoading(false)
    }

    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('name, avatar_url, role')
              .eq('id', session.user.id)
              .single()

            if (error) {
                console.error('Error fetching profile:', error)
                setUserProfile(null)
            } else if (profile) {
                setUserProfile({
                  name: profile.name,
                  avatar: profile.avatar_url,
                  role: profile.role as UserRole,
                })
            }
        } else {
            setUserProfile(null)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SELLER': return <Store className="h-4 w-4" />
      case 'WALKER': return <Dog className="h-4 w-4" />
      case 'CUSTOMER': return <Users className="h-4 w-4" />
      case 'ADMIN': return <Settings className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'SELLER': return 'Vendedor'
      case 'WALKER': return 'Paseador'
      case 'CUSTOMER': return 'Cliente'
      case 'ADMIN': return 'Administrador'
      default: return 'Usuario'
    }
  }

    const getDashboardLink = (role: UserRole | null | undefined) => {
        switch (role) {
            case 'SELLER': return '/seller'
            case 'WALKER': return '/walker'
            case 'CUSTOMER': return '/customer'
            case 'ADMIN': return '/admin'
            default: return '/'
        }
    }

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              PetConnect
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PetConnect
          </Link>

          <div className="flex items-center gap-4">
            <CurrencySelector />
            
            {session && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatar || undefined} alt={userProfile.name || ""} />
                      <AvatarFallback>
                        {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {userProfile.name && (
                        <p className="font-medium">{userProfile.name}</p>
                      )}
                      {session.user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                      {userProfile.role && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getRoleIcon(userProfile.role)}
                          <span>{getRoleName(userProfile.role)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink(userProfile.role)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Mi Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/auth/signup">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
