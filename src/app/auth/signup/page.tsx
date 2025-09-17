
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, EyeOff, Store, Dog, Users } from "lucide-react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          phone: formData.phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mensaje de éxito mejorado que instruye al usuario sobre el siguiente paso.
        setSuccess("¡Cuenta creada! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.");
        // Ya no redirigimos automáticamente. El usuario debe verificar su email primero.
        // setTimeout(() => {
        //   router.push("/auth/signin");
        // }, 3000);
      } else {
        setError(data.error || "Error al crear la cuenta. Es posible que el email ya esté en uso.");
      }
    } catch (error) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "SELLER":
        return "Vendo productos para mascotas";
      case "WALKER":
        return "Ofrezco servicios de paseo";
      case "CUSTOMER":
        return "Busco servicios y productos";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Crear Cuenta</CardTitle>
          <CardDescription>Únete a la comunidad PetConnect</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Si el registro fue exitoso, mostramos solo el mensaje y un link para iniciar sesión */} 
          {success ? (
            <div className="text-center space-y-4">
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                    ¿Ya confirmaste tu cuenta?{" "}
                    <Link href="/auth/signin" className="text-orange-600 hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... el resto del formulario no cambia ... */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Juan Pérez" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="tu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">¿Quién eres?</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona tu rol" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER"><div className="flex items-center gap-2"><Users className="h-4 w-4" />Cliente</div></SelectItem>
                    <SelectItem value="WALKER"><div className="flex items-center gap-2"><Dog className="h-4 w-4" />Paseador</div></SelectItem>
                    <SelectItem value="SELLER"><div className="flex items-center gap-2"><Store className="h-4 w-4" />Vendedor</div></SelectItem>
                  </SelectContent>
                </Select>
                {formData.role && <p className="text-sm text-gray-600 mt-1">{getRoleDescription(formData.role)}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="••••••••" required />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} placeholder="••••••••" required />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading || !formData.role}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando cuenta...</> : "Crear Cuenta"}
              </Button>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/auth/signin" className="text-orange-600 hover:underline">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
