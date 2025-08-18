"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Edit, Clock } from "lucide-react"
import { Schedule } from "@prisma/client"

interface ScheduleFormData {
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface ScheduleModalProps {
  schedule?: Schedule
  onSuccess?: () => void
  children?: React.ReactNode
}

const daysOfWeek = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" }
]

export function ScheduleModal({ schedule, onSuccess, children }: ScheduleModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  })

  useEffect(() => {
    if (schedule) {
      setFormData({
        dayOfWeek: schedule.dayOfWeek.toString(),
        startTime: schedule.startTime,
        endTime: schedule.endTime
      })
    }
  }, [schedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = schedule 
        ? `/api/schedules/${schedule.id}`
        : '/api/schedules'
      
      const method = schedule ? 'PUT' : 'POST'
      
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
          dayOfWeek: "",
          startTime: "",
          endTime: ""
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar el horario')
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Error al guardar el horario')
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
            Agregar Horario
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Editar Horario' : 'Nuevo Horario'}
          </DialogTitle>
          <DialogDescription>
            {schedule 
              ? 'Edita tu horario de disponibilidad.'
              : 'Agrega un nuevo horario de disponibilidad.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Día de la semana</Label>
            <Select 
              value={formData.dayOfWeek} 
              onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un día" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de inicio</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
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
                schedule ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}