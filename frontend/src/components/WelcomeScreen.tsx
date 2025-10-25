import { GraduationCap, Mic, Users, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex flex-col">
      {/* Full Background Overlay */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Logo and Title Section */}
          <div className="relative mb-8 p-8 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-white/50 dark:border-slate-700/50">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <GraduationCap className="w-12 h-12 text-primary-foreground" />
              </div>
              
              <h1 className="text-center text-4xl font-black text-black dark:text-white font-serif">
                ASISvOX
              </h1>
            </div>
          </div>
        
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
        <div className="p-6 flex flex-col items-center space-y-4">
          <div className="w-full max-w-xs space-y-3">
            <Button 
              onClick={onLogin}
              className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Iniciar Sesión
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onRegister}
              className="w-full h-12 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Crear Cuenta
            </Button>
          </div>
          
          <p className="text-center text-muted-foreground text-sm mt-4">
            Compatible con PC, laptops y tablets
          </p>
        </div>
      </div>
    </div>
  );
}