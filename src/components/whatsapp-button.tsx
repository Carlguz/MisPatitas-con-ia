"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
  isAuthorized?: boolean
  showUnauthorized?: boolean
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = "", 
  className = "",
  size = "default",
  variant = "default",
  isAuthorized = true,
  showUnauthorized = false
}: WhatsAppButtonProps) {
  // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
  const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Crear el mensaje para WhatsApp
  const whatsappMessage = message ? `?text=${encodeURIComponent(message)}` : ""
  
  // Crear la URL de WhatsApp
  const whatsappUrl = `https://wa.me/${formattedPhone}${whatsappMessage}`

  const handleClick = () => {
    if (!isAuthorized) {
      alert("Este paseador no tiene habilitado el servicio de WhatsApp. Por favor, contacta a través de otros medios.")
      return
    }
    window.open(whatsappUrl, '_blank')
  }

  // Si no está autorizado y no se debe mostrar el botón no autorizado, no mostrar nada
  if (!isAuthorized && !showUnauthorized) {
    return null
  }

  return (
    <Button
      variant={isAuthorized ? variant : "outline"}
      size={size}
      className={`${isAuthorized ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} ${className}`}
      onClick={handleClick}
      disabled={!isAuthorized}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {isAuthorized ? 'WhatsApp' : 'WhatsApp no disponible'}
    </Button>
  )
}