import { Card } from "../../../../components/ui/card";
import { Button } from "../ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../ui/badge";
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Download, 
  Trash2, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Smartphone,
  Volume2
} from "lucide-react";

export function SettingsScreen() {
  const settingsGroups = [
    {
      title: "Preferencias",
      items: [
        {
          icon: Bell,
          label: "Notificaciones",
          description: "Recibir alertas y recordatorios",
          type: "toggle",
          value: true
        },
        {
          icon: Volume2,
          label: "Sonidos",
          description: "Sonidos de la aplicación",
          type: "toggle",
          value: false
        },
        {
          icon: Moon,
          label: "Modo oscuro",
          description: "Cambiar tema de la aplicación",
          type: "toggle",
          value: false
        },
        {
          icon: Globe,
          label: "Idioma",
          description: "Español",
          type: "navigation",
          badge: "ES"
        }
      ]
    },
    {
      title: "Datos y privacidad",
      items: [
        {
          icon: Shield,
          label: "Privacidad",
          description: "Gestionar datos personales",
          type: "navigation"
        },
        {
          icon: Download,
          label: "Exportar datos",
          description: "Descargar información personal",
          type: "navigation"
        },
        {
          icon: Smartphone,
          label: "Sincronización",
          description: "Sincronizar entre dispositivos",
          type: "toggle",
          value: true
        }
      ]
    },
    {
      title: "Soporte",
      items: [
        {
          icon: HelpCircle,
          label: "Ayuda y soporte",
          description: "Centro de ayuda y contacto",
          type: "navigation"
        },
        {
          icon: Trash2,
          label: "Eliminar cuenta",
          description: "Eliminar permanentemente la cuenta",
          type: "navigation",
          danger: true
        }
      ]
    }
  ];

  const appInfo = {
    version: "1.2.3",
    buildDate: "15 Mar 2024",
    developer: "Tu Equipo de Desarrollo"
  };

  return (
    <div className="p-4 space-y-6">
      {/* Account Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3>Juan Pérez</h3>
            <p className="text-sm text-muted-foreground">Plan gratuito</p>
          </div>
          <Badge variant="outline">Actualizar</Badge>
        </div>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            {group.title}
          </h3>
          <Card className="p-0">
            {group.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <div
                  key={itemIndex}
                  className={`flex items-center justify-between p-4 ${
                    itemIndex < group.items.length - 1 ? "border-b" : ""
                  } ${item.danger ? "hover:bg-red-50" : "hover:bg-muted/50"} transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.danger ? "text-red-500" : "text-muted-foreground"}`} />
                    <div>
                      <p className={`font-medium ${item.danger ? "text-red-600" : ""}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.type === "toggle" ? (
                      <Switch checked={item.value} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      {/* App Info */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Información de la app
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versión</span>
            <span>{appInfo.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última actualización</span>
            <span>{appInfo.buildDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desarrollador</span>
            <span>{appInfo.developer}</span>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50">
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>

      {/* Bottom Padding for Navigation */}
      <div className="h-16"></div>
    </div>
  );
}