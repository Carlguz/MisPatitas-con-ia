"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppFloatProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppFloat({ 
  phoneNumber = "+1234567890", 
  message = "Hola, necesito ayuda con PetConnect" 
}: WhatsAppFloatProps) {
  // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
  const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Crear el mensaje para WhatsApp
  const whatsappMessage = message ? `?text=${encodeURIComponent(message)}` : ""
  
  // Crear la URL de WhatsApp
  const whatsappUrl = `https://wa.me/${formattedPhone}${whatsappMessage}`

  const handleClick = () => {
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg animate-bounce"
      onClick={handleClick}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Contactar por WhatsApp</span>
    </Button>
  )
}