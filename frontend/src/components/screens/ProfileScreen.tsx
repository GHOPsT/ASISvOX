import { Card } from "../../../../components/ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Edit, Mail, Calendar, Trophy, Target, Clock } from "lucide-react";

export function ProfileScreen() {
  const stats = [
    { label: "Tareas completadas", value: "124", icon: Trophy, color: "text-yellow-600" },
    { label: "Racha actual", value: "7 días", icon: Target, color: "text-green-600" },
    { label: "Tiempo promedio", value: "2.5h", icon: Clock, color: "text-blue-600" },
  ];

  const achievements = [
    { title: "Primer paso", description: "Completaste tu primera tarea", earned: true },
    { title: "Productivo", description: "Completaste 10 tareas en un día", earned: true },
    { title: "Constante", description: "Mantén una racha de 7 días", earned: true },
    { title: "Experto", description: "Completa 100 tareas", earned: false },
  ];

  const recentActivity = [
    { action: "Completó 3 tareas", time: "Hace 2 horas", type: "success" },
    { action: "Agregó nueva tarea", time: "Hace 5 horas", type: "info" },
    { action: "Alcanzó racha de 7 días", time: "Ayer", type: "achievement" },
    { action: "Completó 5 tareas", time: "Hace 2 días", type: "success" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "info": return "ℹ️";
      case "achievement": return "🏆";
      default: return "📝";
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="text-xl">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl">Juan Pérez</h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">juan.perez@email.com</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Miembro desde Mar 2024</span>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        <h3>Logros</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <Card key={index} className={`p-3 ${achievement.earned ? "bg-primary/5 border-primary/20" : "opacity-50"}`}>
              <div className="text-center space-y-2">
                <div className="text-2xl">
                  {achievement.earned ? "🏆" : "🔒"}
                </div>
                <div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <Badge variant="secondary" className="text-xs">
                    Completado
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3>Actividad reciente</h3>
        <div className="space-y-2">
          {recentActivity.map((activity, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}