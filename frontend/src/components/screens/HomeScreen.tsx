import { Card } from "../../../../components/ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plus, TrendingUp, Calendar, Clock } from "lucide-react";

export function HomeScreen() {
  const stats = [
    { label: "Tareas completadas", value: "12", change: "+3 hoy", icon: TrendingUp },
    { label: "Pendientes", value: "5", change: "2 urgentes", icon: Clock },
    { label: "Esta semana", value: "28", change: "+15%", icon: Calendar },
  ];

  const recentTasks = [
    { id: 1, title: "Revisar presentación", completed: true, priority: "alta" },
    { id: 2, title: "Llamar al cliente", completed: false, priority: "alta" },
    { id: 3, title: "Actualizar documentación", completed: false, priority: "media" },
    { id: 4, title: "Planificar reunión", completed: true, priority: "baja" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "destructive";
      case "media": return "secondary";
      case "baja": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl mb-2">¡Buen día! 👋</h2>
        <p className="text-muted-foreground">
          Tienes 5 tareas pendientes por completar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3>Acciones rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12 justify-start gap-3">
            <Plus className="h-5 w-5" />
            Nueva tarea
          </Button>
          <Button variant="outline" className="h-12 justify-start gap-3">
            <Calendar className="h-5 w-5" />
            Mi agenda
          </Button>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="space-y-3">
        <h3>Tareas recientes</h3>
        <div className="space-y-2">
          {recentTasks.map((task) => (
            <Card key={task.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.completed ? "bg-green-500" : "bg-muted"
                  }`} />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
                <Badge variant={getPriorityColor(task.priority) as any}>
                  {task.priority}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}