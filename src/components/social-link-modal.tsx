"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Edit, Share2 } from "lucide-react"
import { SocialLink } from "@prisma/client"

interface SocialLinkFormData {
  platform: string
  url: string
}

interface SocialLinkModalProps {
  socialLink?: SocialLink
  onSuccess?: () => void
  children?: React.ReactNode
}

const platforms = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Sitio Web" }
]

export function SocialLinkModal({ socialLink, onSuccess, children }: SocialLinkModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SocialLinkFormData>({
    platform: "",
    url: ""
  })

  useEffect(() => {
    if (socialLink) {
      setFormData({
        platform: socialLink.platform,
        url: socialLink.url
      })
    }
  }, [socialLink])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = socialLink 
        ? `/api/social-links/${socialLink.id}`
        : '/api/social-links'
      
      const method = socialLink ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess?.()
        setOpen(false)
        // Reset form
        setFormData({
          platform: "",
          url: ""
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar el enlace social')
      }
    } catch (error) {
      console.error('Error saving social link:', error)
      alert('Error al guardar el enlace social')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Red Social
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {socialLink ? 'Editar Red Social' : 'Nueva Red Social'}
          </DialogTitle>
          <DialogDescription>
            {socialLink 
              ? 'Edita la información de tu red social.'
              : 'Agrega una nueva red social a tu perfil.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma</Label>
            <Select 
              value={formData.platform} 
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plataforma" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://ejemplo.com/tu-perfil"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                socialLink ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}