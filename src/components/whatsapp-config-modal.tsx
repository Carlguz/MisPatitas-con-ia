"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Smartphone,
  DollarSign
} from "lucide-react"
import { useCurrencyContext } from "@/components/currency-provider"

interface WhatsAppConfig {
  whatsapp?: string
  whatsappEnabled: boolean
  whatsappPaid: boolean
}

interface WhatsAppConfigModalProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function WhatsAppConfigModal({ children, onSuccess }: WhatsAppConfigModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<WhatsAppConfig>({
    whatsappEnabled: false,
    whatsappPaid: false
  })
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const { format, formatDual, currency } = useCurrencyContext()

  // Precio del servicio en soles peruanos
  const WHATSAPP_SERVICE_PRICE_PEN = 37.00 // S/. 37.00 (aproximadamente $10 USD)

  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/walkers/whatsapp')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.walker)
        setWhatsappNumber(data.walker.whatsapp || "")
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error)
    }
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/walkers/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          whatsapp: whatsappNumber,
          whatsappEnabled: config.whatsappEnabled
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.walker)
        setMessage({ type: "success", text: "Configuración guardada exitosamente" })
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Error al guardar la configuración" })
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error)
      setMessage({ type: "error", text: "Error al guardar la configuración" })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/walkers/whatsapp/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: "stripe" // Simulación
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.walker)
        setShowPayment(false)
        setMessage({ type: "success", text: data.message })
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Error al procesar el pago" })
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setMessage({ type: "error", text: "Error al procesar el pago" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Configuración de WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configura tu número de WhatsApp para que los clientes puedan contactarte directamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"}>
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Estado actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Número configurado</span>
                {config.whatsapp ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {config.whatsapp}
                  </Badge>
                ) : (
                  <Badge variant="secondary">No configurado</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servicio activo</span>
                {config.whatsappEnabled && config.whatsappPaid ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pago realizado</span>
                {config.whatsappPaid ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Pagado
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pendiente</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración del número */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Número de WhatsApp
              </CardTitle>
              <CardDescription>
                Ingresa tu número de WhatsApp con código de país (ej: +34 600 000 000)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="whatsapp-enabled"
                  checked={config.whatsappEnabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, whatsappEnabled: checked }))
                  }
                />
                <Label htmlFor="whatsapp-enabled">Habilitar WhatsApp para clientes</Label>
              </div>

              <Button 
                onClick={handleSaveConfig} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </CardContent>
          </Card>

          {/* Sección de pago */}
          {config.whatsapp && !config.whatsappPaid && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Activar Servicio
                </CardTitle>
                <CardDescription>
                  Paga una tarifa única para activar el servicio de WhatsApp y que los clientes puedan contactarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showPayment ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Beneficios del servicio:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Los clientes podrán contactarte directamente por WhatsApp</li>
                        <li>• Aumenta la confianza y seguridad de los clientes</li>
                        <li>• Mejora la comunicación con tus clientes</li>
                        <li>• Acceso prioritario en las búsquedas</li>
                      </ul>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {format(WHATSAPP_SERVICE_PRICE_PEN)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDual(WHATSAPP_SERVICE_PRICE_PEN)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pago único - Sin suscripción mensual
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowPayment(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Activar Servicio
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Esta es una simulación del proceso de pago. En producción, se integraría con Stripe u otro procesador de pagos.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Método de pago</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => handlePayment()}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Tarjeta de crédito/débito
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Información de seguridad */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Protección de datos</p>
                  <p>
                    Tu número de WhatsApp solo se mostrará a clientes que hayan realizado una reserva contigo. 
                    Nos comprometemos a proteger tu privacidad y la de tus clientes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}