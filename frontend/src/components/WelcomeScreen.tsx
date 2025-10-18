import { GraduationCap, Mic, Users, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-center mb-3 text-primary">
          ASISvOX
        </h1>
        
        <p className="text-center text-muted-foreground mb-12 px-4">
          Gestión educativa inteligente con reconocimiento de voz para una experiencia más eficiente
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">Reconocimiento de Voz</h3>
              <p className="text-muted-foreground">Toma asistencia y califica con comandos de voz</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">Gestión de Estudiantes</h3>
              <p className="text-muted-foreground">Administra clases y estudiantes fácilmente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">Reportes Inteligentes</h3>
              <p className="text-muted-foreground">Genera reportes automáticos en PDF y Excel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3">
        <Button 
          onClick={onLogin}
          className="w-full h-12"
        >
          Iniciar Sesión
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRegister}
          className="w-full h-12"
        >
          Crear Cuenta
        </Button>
        
        <p className="text-center text-muted-foreground">
          Compatible con PC, laptops y tablets
        </p>
      </div>
    </div>
  );
}