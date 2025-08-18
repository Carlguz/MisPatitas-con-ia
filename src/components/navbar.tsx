"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Store, Dog, Users, LogOut, Settings } from "lucide-react"
import { UserRole } from "@prisma/client"
import { CurrencySelector } from "@/components/currency-selector"

export function Navbar() {
  const { data: session, status } = useSession()

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SELLER:
        return <Store className="h-4 w-4" />
      case UserRole.WALKER:
        return <Dog className="h-4 w-4" />
      case UserRole.CUSTOMER:
        return <Users className="h-4 w-4" />
      case UserRole.ADMIN:
        return <Settings className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.SELLER:
        return "Vendedor"
      case UserRole.WALKER:
        return "Paseador"
      case UserRole.CUSTOMER:
        return "Cliente"
      case UserRole.ADMIN:
        return "Administrador"
      default:
        return "Usuario"
    }
  }

  const getDashboardLink = (role: UserRole) => {
    switch (role) {
      case UserRole.SELLER:
        return "/seller"
      case UserRole.WALKER:
        return "/walker"
      case UserRole.CUSTOMER:
        return "/customer"
      case UserRole.ADMIN:
        return "/admin"
      default:
        return "/"
    }
  }

  if (status === "loading") {
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
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.avatar} alt={session.user.name || ""} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                      {session.user.role && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getRoleIcon(session.user.role)}
                          <span>{getRoleName(session.user.role)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink(session.user.role)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Mi Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
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