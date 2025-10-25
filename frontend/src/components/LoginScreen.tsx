import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface LoginScreenProps {
  onBack: () => void;
  onRegister: () => void;
}

export function LoginScreen({ onBack, onRegister }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "📧 El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "❌ El formato de correo no es válido (ej: usuario@dominio.com)";
    }
    
    if (!formData.password) {
      newErrors.password = "🔐 La contraseña es requerida";
    } else if (formData.password.length < 3) {
      newErrors.password = "❌ La contraseña debe tener al menos 3 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        toast.error("❌ Credenciales Inválidas", {
          description: "El correo o contraseña que ingresaste no son correctos. Por favor, verifica e intenta de nuevo.",
          duration: 5000,
        });
      } else {
        toast.success("✅ ¡Bienvenido a ASISvOX!", {
          description: "Tu sesión ha sido iniciada correctamente.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("❌ Error al Iniciar Sesión", {
        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        duration: 5000,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const fillTestCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-foreground">Iniciar Sesión</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-primary mb-2">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder a ASISvOX
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 border-2 border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={onRegister}
              >
                Regístrate aquí
              </Button>
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-3">
              <strong>🧪 Credenciales de Prueba:</strong>
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-background rounded border border-blue-200 hover:border-blue-400 transition-colors">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>👨‍🏫 Profesor</strong>
                </p>
                <p className="text-xs text-foreground mb-2">
                  <span className="font-mono">profesor@asisVox.com</span><br />
                  <span className="font-mono">demo123</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => fillTestCredentials('profesor@asisVox.com', 'demo123')}
                >
                  Usar Credenciales
                </Button>
              </div>
              <div className="p-3 bg-background rounded border border-green-200 hover:border-green-400 transition-colors">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>👨‍💼 Administrador</strong>
                </p>
                <p className="text-xs text-foreground mb-2">
                  <span className="font-mono">admin@asisVox.com</span><br />
                  <span className="font-mono">admin123</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => fillTestCredentials('admin@asisVox.com', 'admin123')}
                >
                  Usar Credenciales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}